import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { Environment, ServicesConfig } from '../../../../../../src/environment';
import { TargetAppApiService } from '../../../../../../src/modules/app/proxy/services';
import { ExtendedEventDto } from '../../../../../../src/modules/common';
import { GraphQLClientService } from '../../../../../../src/modules/infra';

const CONFIG_SERVICE: Partial<ConfigService<Environment>> = {
  get: jest.fn().mockReturnValue({ target: { rateLimit: {} } } as Partial<ServicesConfig>),
};
const EXTENDED_DTO: ExtendedEventDto = new ExtendedEventDto({
  id: 'b33bad7c-837d-4a5b-9f56-20d46f5c571d',
  name: 'Test name',
  body: 'Test body',
  timestamp: new Date(),
  brand: 'Test brand',
});

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
    expect(graphQLClientService.request).toHaveBeenCalledTimes(1);
  });
});
