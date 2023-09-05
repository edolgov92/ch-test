import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { Environment, ServicesConfig, TargetServiceConfig } from '../../../../../../src/environment';
import { TargetAppApiService } from '../../../../../../src/modules/app/proxy/services';
import { ExtendedEventDto } from '../../../../../../src/modules/common';
import { GraphQLClientService } from '../../../../../../src/modules/infra';

const TARGET_SERVICE_CONFIG: TargetServiceConfig = {
  graphqlUrl: 'https://test.com/graphql',
  requestRetries: 1,
  rateLimit: {
    intervalMs: 1000,
    requestsPerInterval: 1,
  },
};
const CONFIG_SERVICE: Partial<ConfigService<Environment>> = {
  get: jest.fn().mockReturnValue({ target: TARGET_SERVICE_CONFIG } as Partial<ServicesConfig>),
};
const EXTENDED_DTO: ExtendedEventDto = new ExtendedEventDto({
  id: 'b33bad7c-837d-4a5b-9f56-20d46f5c571d',
  name: 'Test name',
  body: 'Test body',
  timestamp: new Date(),
  brand: 'Test brand',
});
const MUTATION_QUERY: string = `
      mutation ProcessEvent($input: ProcessEventInput!) {
        processEvent(input: $input) {
          id
        }
      }
    `;

describe('TargetAppApiService', () => {
  let graphQLClientService: Partial<GraphQLClientService>;
  let targetAppApiService: TargetAppApiService;

  beforeEach(async () => {
    graphQLClientService = { setConfig: jest.fn(), request: jest.fn() };
    targetAppApiService = new TargetAppApiService(
      graphQLClientService as GraphQLClientService,
      CONFIG_SERVICE as ConfigService<Environment>,
    );
    await Test.createTestingModule({
      providers: [
        {
          provide: TargetAppApiService,
          useValue: targetAppApiService,
        },
      ],
    }).compile();
  });

  it('should send extended event using Graphql to Target service successfuly', async () => {
    await targetAppApiService.sendExtendedEvent(EXTENDED_DTO);
    expect(graphQLClientService.request).toHaveBeenNthCalledWith(1, MUTATION_QUERY, { input: EXTENDED_DTO });
  });

  it('should set proper config in graphQLClient during initialization', async () => {
    expect(graphQLClientService.setConfig).toHaveBeenNthCalledWith(1, {
      endpoint: TARGET_SERVICE_CONFIG.graphqlUrl,
      rateLimitIntervalMs: TARGET_SERVICE_CONFIG.rateLimit.intervalMs,
      rateLimitRequestsPerInterval: TARGET_SERVICE_CONFIG.rateLimit.requestsPerInterval,
      retries: TARGET_SERVICE_CONFIG.requestRetries,
    });
  });
});
