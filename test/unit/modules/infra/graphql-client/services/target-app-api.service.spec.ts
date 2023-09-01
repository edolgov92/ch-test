import { Test, TestingModule } from '@nestjs/testing';
import { gql, Variables } from 'graphql-request';
import { GraphQLClientConfig, GraphQLClientService } from '../../../../../../src/modules/infra';
import { GRAPHQL_CLIENT_TYPE_TOKEN } from '../../../../../../src/modules/infra/graphql-client/constants';

const RESPONSE_VALUE = { data: { ok: true } };
const GRAPHQL_CLIENT = { request: jest.fn().mockResolvedValue(RESPONSE_VALUE), setEndpoint: jest.fn() };
const GRAPHQL_CLIENT_TYPE = class {
  constructor() {
    return GRAPHQL_CLIENT;
  }
};
const GRAPHQL_CLIENT_CONFIG: GraphQLClientConfig = {
  endpoint: 'https://test.com/graphql',
};

describe('ProxyHttpController', () => {
  let graphQLClientService: GraphQLClientService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GraphQLClientService,
        { provide: GRAPHQL_CLIENT_TYPE_TOKEN, useValue: GRAPHQL_CLIENT_TYPE },
      ],
    }).compile();

    graphQLClientService = await module.resolve<GraphQLClientService>(GraphQLClientService);
    graphQLClientService.updateConfig(GRAPHQL_CLIENT_CONFIG);
  });

  it('should make request using graphql client', async () => {
    const spy: jest.SpyInstance = jest.spyOn(GRAPHQL_CLIENT, 'request');
    const mutation: string = gql`
      mutation ProcessEvent($input: ProcessEventInput!) {
        processEvent(input: $input) {
          id
        }
      }
    `;
    const variables: Variables = {
      input: { id: '123456' },
    };
    await graphQLClientService.request(mutation, variables);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should return valid response value', async () => {
    const mutation: string = gql`
      mutation ProcessEvent($input: ProcessEventInput!) {
        processEvent(input: $input) {
          id
        }
      }
    `;
    const variables: Variables = {
      input: { id: '123456' },
    };
    const response = await graphQLClientService.request(mutation, variables);
    expect(response).toEqual(RESPONSE_VALUE);
  });
});
