import { GraphQLRequestModule } from '@golevelup/nestjs-graphql-request';
import { Module } from '@nestjs/common';
import { environment } from '../../environment';
import { QueueModule } from '../queue';
import * as Controllers from './controllers';
import * as Services from './services';

@Module({
  imports: [
    QueueModule,
    GraphQLRequestModule.forRoot(GraphQLRequestModule, {
      endpoint: environment.services.target.graphqlUrl,
    }),
  ],
  controllers: [Controllers.ProxyHttpController, Controllers.ProxyQueueController],
  providers: [Services.TargetAppApiService],
})
export class ProxyModule {}
