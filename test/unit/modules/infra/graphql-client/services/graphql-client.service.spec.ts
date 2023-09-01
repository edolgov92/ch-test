import { Test } from '@nestjs/testing';
import { gql, GraphQLClient, Variables } from 'graphql-request';
import { RateLimiter } from 'limiter';
import { GraphQLClientConfig, GraphQLClientService } from '../../../../../../src/modules/infra';

const GRAPHQL_CLIENT_CONFIG: GraphQLClientConfig = {
  endpoint: 'https://test.com/graphql',
};
const MUTATION: string = gql`
  mutation Test($input: TestInput!) {
    test(input: $input) {
      id
    }
  }
`;
const RESPONSE_VALUE = { data: { ok: true } };
const VARIABLES: Variables = { input: { id: '123' } };

class TestGraphQLClientService extends GraphQLClientService {
  constructor(
    private graphQLClient: GraphQLClient,
    private rateLimiter: RateLimiter,
  ) {
    super();
  }

  protected createGraphQLClient(): GraphQLClient {
    return this.graphQLClient;
  }

  protected createRateLimiter(): RateLimiter {
    return this.rateLimiter;
  }
}

describe('GraphQLClientService', () => {
  let graphQLClient: Partial<GraphQLClient>;
  let graphQLClientService: GraphQLClientService;
  let rateLimiter: Partial<RateLimiter>;

  beforeEach(async () => {
    graphQLClient = {
      request: jest.fn().mockResolvedValue(RESPONSE_VALUE),
      setEndpoint: jest.fn(),
    };
    rateLimiter = { removeTokens: jest.fn() };
    graphQLClientService = new TestGraphQLClientService(
      graphQLClient as GraphQLClient,
      rateLimiter as RateLimiter,
    );
    graphQLClientService.setConfig(GRAPHQL_CLIENT_CONFIG);

    await Test.createTestingModule({
      providers: [{ provide: GraphQLClientService, useValue: graphQLClientService }],
    }).compile();
  });

  it('should make request using graphql client', async () => {
    await graphQLClientService.request(MUTATION, VARIABLES);
    expect(graphQLClient.request).toHaveBeenCalledTimes(1);
  });

  it('should return valid response value', async () => {
    const response = await graphQLClientService.request(MUTATION, VARIABLES);
    expect(response).toEqual(RESPONSE_VALUE);
  });

  it('should throw error if endpoint is not configured', async () => {
    graphQLClientService.setConfig({ endpoint: '' });
    await expect(graphQLClientService.request(MUTATION, VARIABLES)).rejects.toThrow(
      'Endpoint is not configured',
    );
  });

  it('should activate rate limiter if configured', async () => {
    graphQLClientService.setConfig({
      rateLimitIntervalMs: 1000,
      rateLimitRequestsPerInterval: 1,
    });
    await graphQLClientService.request(MUTATION, VARIABLES);
    expect(rateLimiter.removeTokens).toHaveBeenCalledTimes(1);
  });

  it('should retry on failure', async () => {
    const spy: jest.SpyInstance = jest.spyOn(graphQLClient, 'request');
    spy.mockRejectedValueOnce(new Error('Mocked error')); // First call will be rejected
    spy.mockResolvedValueOnce(RESPONSE_VALUE); // Second call will resolve

    graphQLClientService.setConfig({
      retries: 1,
    });

    const response = await graphQLClientService.request(MUTATION, VARIABLES);
    expect(response).toEqual(RESPONSE_VALUE);
    expect(spy).toHaveBeenCalledTimes(2);
  });
});