import { Module } from '@nestjs/common';
import { environment } from '../../../environment';
import { GRAPHQL_CLIENT_TESTING_MODE_TOKEN } from './constants';
import { GraphQLClientService } from './services';

@Module({
  providers: [
    GraphQLClientService,
    { provide: GRAPHQL_CLIENT_TESTING_MODE_TOKEN, useValue: environment.graphQLClientTestingMode },
  ],
  exports: [GraphQLClientService],
})
export class GraphQLClientModule {}
