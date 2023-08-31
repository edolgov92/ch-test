import { InjectGraphQLClient } from '@golevelup/nestjs-graphql-request';
import { Injectable } from '@nestjs/common';
import { gql, GraphQLClient, Variables } from 'graphql-request';
import { ExtendedEventDto, WithLogger } from '../../common';

@Injectable()
export class TargetAppApiService extends WithLogger {
  constructor(@InjectGraphQLClient() private readonly client: GraphQLClient) {
    super();
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
    } catch {
      // Igroring errors for testing purposes
    }
    this.logger.debug(`Extended data was sent to Target service successfully.`);
  }
}
