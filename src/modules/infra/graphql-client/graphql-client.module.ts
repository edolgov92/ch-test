import { Module } from '@nestjs/common';
import { GraphQLClientService } from './services';

@Module({
  providers: [GraphQLClientService],
  exports: [GraphQLClientService],
})
export class GraphQLClientModule {}
