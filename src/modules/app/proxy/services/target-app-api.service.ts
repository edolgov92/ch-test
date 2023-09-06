import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { gql, Variables } from 'graphql-request';
import { Environment, ServicesConfig, TargetServiceConfig } from '../../../../environment';
import { ExtendedEventDto, WithLogger } from '../../../common';
import { GraphQLClientService } from '../../../infra';

@Injectable()
export class TargetAppApiService extends WithLogger {
  constructor(
    private client: GraphQLClientService,
    private configService: ConfigService<Environment>,
  ) {
    super();

    const targetServiceConfig: TargetServiceConfig =
      this.configService.get<ServicesConfig>('services').target;
    this.client.setConfig({
      endpoint: targetServiceConfig.graphqlUrl,
      rateLimitIntervalMs: targetServiceConfig.rateLimit.intervalMs,
      rateLimitRequestsPerInterval: targetServiceConfig.rateLimit.requestsPerInterval,
      retries: targetServiceConfig.requestRetries,
    });
  }

  /**
   * Sends extended event to Target service using GraphQL client
   * @param {ExtendedEventDto} extendedDto - extended event data
   */
  async sendExtendedEvent(extendedDto: ExtendedEventDto): Promise<void> {
    const mutation: string = gql`
      mutation ProcessEvent($input: ProcessEventInput!) {
        processEvent(input: $input) {
          id
        }
      }
    `;
    const variables: Variables = {
      input: extendedDto,
    };
    try {
      await this.client.request(mutation, variables);
      this.logger.debug(`${extendedDto.id} | Extended event was sent to Target service successfully.`);
    } catch (ex) {
      this.logger.error(`Failed to send extended event to Target service`);
    }
  }
}
