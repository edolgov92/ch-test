import { GraphQLRequestModule } from '@golevelup/nestjs-graphql-request';
import { Module } from '@nestjs/common';
import { ClientProviderOptions, ClientsModule } from '@nestjs/microservices';
import { environment } from '../../environment';
import { getEnvironmentMicroserviceConfig } from '../common';
import { QUEUE_CLIENT_TOKEN } from './constants';
import * as Controllers from './controllers';
import * as Services from './services';

@Module({
  imports: [
    ClientsModule.register([
      {
        ...getEnvironmentMicroserviceConfig(),
        name: QUEUE_CLIENT_TOKEN,
      } as ClientProviderOptions,
    ]),
    GraphQLRequestModule.forRoot(GraphQLRequestModule, {
      endpoint: environment.services.target.graphqlUrl,
    }),
  ],
  controllers: [Controllers.ProxyHttpController, Controllers.ProxyQueueController],
  providers: [Services.TargetAppApiService],
})
export class ProxyModule {}
