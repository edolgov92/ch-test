import { Module } from '@nestjs/common';
import { GraphQLClient } from 'graphql-request';
import { GRAPHQL_CLIENT_TYPE_TOKEN } from './constants';
import { GraphQLClientService } from './services';

@Module({
  providers: [GraphQLClientService, { provide: GRAPHQL_CLIENT_TYPE_TOKEN, useValue: GraphQLClient }],
  exports: [GraphQLClientService],
})
export class GraphQLClientModule {}
