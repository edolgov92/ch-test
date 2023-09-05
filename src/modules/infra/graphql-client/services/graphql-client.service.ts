import { Injectable, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as retry from 'async-retry';
import { GraphQLClient, RequestDocument, Variables } from 'graphql-request';
import { VariablesAndRequestHeadersArgs } from 'graphql-request/build/esm/types';
import { RateLimiter } from 'limiter';
import { Environment } from '../../../../environment';
import { WithLogger } from '../../../common';
import { GraphQLClientConfig } from '../interfaces';

@Injectable({ scope: Scope.TRANSIENT })
export class GraphQLClientService extends WithLogger {
  private client: GraphQLClient;
  private config: GraphQLClientConfig = {};
  private limiter: RateLimiter;
  private testingMode: boolean;

  constructor(private configService: ConfigService<Environment>) {
    super();
    this.testingMode = this.configService.get('graphQLClientTestingMode');
  }

  // Apply configs to client
  setConfig(config: GraphQLClientConfig): void {
    if (typeof config.endpoint === 'string' && config.endpoint !== this.config.endpoint) {
      this.config.endpoint = config.endpoint;
      if (this.client) {
        this.client.setEndpoint(this.config.endpoint);
      } else {
        this.client = this.createGraphQLClient(this.config.endpoint);
      }
    }
    let rateLimiterConfigUpdated: boolean = false;
    if (
      typeof config.rateLimitIntervalMs === 'number' &&
      config.rateLimitIntervalMs !== this.config.rateLimitIntervalMs
    ) {
      this.config.rateLimitIntervalMs = config.rateLimitIntervalMs;
      rateLimiterConfigUpdated = true;
    }
    if (
      typeof config.rateLimitRequestsPerInterval === 'number' &&
      config.rateLimitRequestsPerInterval !== this.config.rateLimitRequestsPerInterval
    ) {
      this.config.rateLimitRequestsPerInterval = config.rateLimitRequestsPerInterval;
      rateLimiterConfigUpdated = true;
    }
    if (rateLimiterConfigUpdated) {
      if (this.config.rateLimitIntervalMs && this.config.rateLimitRequestsPerInterval) {
        this.limiter = this.createRateLimiter(
          this.config.rateLimitIntervalMs,
          this.config.rateLimitRequestsPerInterval,
        );
      } else {
        this.limiter = undefined;
      }
    }
    if (typeof config.retries === 'number' && config.retries !== this.config.retries) {
      this.config.retries = config.retries;
    }
  }

  async request<T, V extends Variables = Variables>(
    document: RequestDocument,
    ...variablesAndRequestHeaders: VariablesAndRequestHeadersArgs<V>
  ): Promise<T> {
    if (!this.config.endpoint) {
      throw new Error('Endpoint is not configured');
    }
    return this.config.retries > 0
      ? this.retryRequest(document, ...variablesAndRequestHeaders)
      : this.doRequest(document, ...variablesAndRequestHeaders);
  }

  protected createGraphQLClient(endpoint: string): GraphQLClient {
    return new GraphQLClient(endpoint);
  }

  protected createRateLimiter(
    rateLimitIntervalMs: number,
    rateLimitRequestsPerInterval: number,
  ): RateLimiter {
    return new RateLimiter({
      interval: rateLimitIntervalMs,
      tokensPerInterval: rateLimitRequestsPerInterval,
    });
  }

  private retryRequest<T, V extends Variables = Variables>(
    document: RequestDocument,
    ...variablesAndRequestHeaders: VariablesAndRequestHeadersArgs<V>
  ): Promise<T> {
    let attempt: number = 1;
    return retry(
      async () => {
        try {
          // In testing mode we can simulate resource unavailability
          if (this.testingMode && attempt === 1 && Math.random() > 0.9) {
            throw new Error('Error to simulate resource unavailability');
          }
          const data: T = await this.doRequest(document, ...variablesAndRequestHeaders);
          return data;
        } catch (err) {
          this.logger.warn(
            `Failed to send request in attempt ${attempt}${
              this.config.retries > attempt - 1 ? ', retrying...' : ', throwing error'
            }`,
          );
          throw err;
        } finally {
          attempt++;
        }
      },
      {
        retries: this.config.retries, // number of retries before giving up
        factor: 2, // exponential factor
        minTimeout: 1 * 1000, // the number of milliseconds before starting the first retry
        maxTimeout: 60 * 1000, // the maximum number of milliseconds between two retries
        randomize: true, // randomizes the timeouts by multiplying a factor between 1-2
      },
    );
  }

  private async doRequest<T, V extends Variables = Variables>(
    document: RequestDocument,
    ...variablesAndRequestHeaders: VariablesAndRequestHeadersArgs<V>
  ): Promise<T> {
    if (this.limiter) {
      await this.limiter.removeTokens(1);
    }
    try {
      const response: T = await this.client.request(document, ...variablesAndRequestHeaders);
      return response;
    } catch (ex) {
      if (this.testingMode) {
        // Return data anyway for testing
        return { ok: true } as T;
      } else {
        throw ex;
      }
    }
  }
}
