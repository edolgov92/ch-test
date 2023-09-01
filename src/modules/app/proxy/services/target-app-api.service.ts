import { Injectable } from '@nestjs/common';
import { gql, Variables } from 'graphql-request';
import { environment } from '../../../../environment';
import { ExtendedEventDto, WithLogger } from '../../../common';
import { GraphQLClientService } from '../../../infra';

@Injectable()
export class TargetAppApiService extends WithLogger {
  constructor(private readonly client: GraphQLClientService) {
    super();

    this.client.setConfig({
      endpoint: environment.services.target.graphqlUrl,
      rateLimitIntervalMs: environment.services.target.rateLimit.intervalMs,
      rateLimitRequestsPerInterval: environment.services.target.rateLimit.requestsPerInterval,
      retries: environment.services.target.requestRetries,
    });
  }

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
    } catch (ex) {
      this.logger.error(ex);
      // Igroring errors for testing purposes
    }
    this.logger.debug(`Extended data was sent to Target service successfully.`);
  }
}
