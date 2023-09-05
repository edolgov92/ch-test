import { Module } from '@nestjs/common';
import { GraphQLClientModule, QueueModule } from '../../infra';
import * as Controllers from './controllers';
import * as Services from './services';

@Module({
  imports: [QueueModule, GraphQLClientModule],
  controllers: [Controllers.ProxyHttpController, Controllers.ProxyQueueController],
  providers: [Services.TargetAppApiService],
})
export class ProxyModule {}
