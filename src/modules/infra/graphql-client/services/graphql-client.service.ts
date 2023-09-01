import { Inject, Injectable, Scope } from '@nestjs/common';
import * as retry from 'async-retry';
import { GraphQLClient, RequestDocument, Variables } from 'graphql-request';
import { VariablesAndRequestHeadersArgs } from 'graphql-request/build/esm/types';
import { RateLimiter } from 'limiter';
import { WithLogger } from '../../../common';
import { GRAPHQL_CLIENT_TYPE_TOKEN } from '../constants';
import { GraphQLClientConfig } from '../interfaces';

@Injectable({ scope: Scope.TRANSIENT })
export class GraphQLClientService extends WithLogger {
  private client: GraphQLClient;
  private endpoint: string = '';
  private limiter: RateLimiter;
  private retries: number = 0;

  constructor(@Inject(GRAPHQL_CLIENT_TYPE_TOKEN) private clientType: typeof GraphQLClient) {
    super();
    this.client = new clientType(this.endpoint);
  }

  updateConfig(config: GraphQLClientConfig): void {
    this.endpoint = config.endpoint;
    this.client.setEndpoint(this.endpoint);
    if (config.rateLimitIntervalMs || config.rateLimitRequestsPerInterval) {
      const interval: number = config.rateLimitIntervalMs || 1000;
      const tokensPerInterval: number = config.rateLimitRequestsPerInterval || 1;
      this.limiter = new RateLimiter({ interval, tokensPerInterval });
    }
    if (config.retries) {
      this.retries = config.retries;
    }
  }

  async request<T, V extends Variables = Variables>(
    document: RequestDocument,
    ...variablesAndRequestHeaders: VariablesAndRequestHeadersArgs<V>
  ): Promise<T> {
    if (!this.endpoint) {
      throw new Error('Endpoint is not configured');
    }
    return this.retries
      ? this.retryRequest(document, ...variablesAndRequestHeaders)
      : this.doRequest(document, ...variablesAndRequestHeaders);
  }

  private retryRequest<T, V extends Variables = Variables>(
    document: RequestDocument,
    ...variablesAndRequestHeaders: VariablesAndRequestHeadersArgs<V>
  ): Promise<T> {
    let attempt: number = 1;
    return retry(
      async () => {
        try {
          const data: T = await this.doRequest(document, ...variablesAndRequestHeaders);
          return data;
        } catch (err) {
          this.logger.warn(
            `Failed to send request in attempt ${attempt}${
              this.retries > attempt - 1 ? ', retrying...' : ', throwing error'
            }`,
          );
          throw err;
        } finally {
          attempt++;
        }
      },
      {
        retries: this.retries, // number of retries before giving up
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
    return this.client.request(document, ...variablesAndRequestHeaders);
  }
}
