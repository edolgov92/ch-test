import { Test, TestingModule } from '@nestjs/testing';
import { TargetAppApiService } from '../../../../../../src/modules/app/proxy/services';
import { ExtendedEventDto } from '../../../../../../src/modules/common';
import { GraphQLClientService } from '../../../../../../src/modules/infra';

const EXTENDED_DTO: ExtendedEventDto = new ExtendedEventDto({
  id: 'b33bad7c-837d-4a5b-9f56-20d46f5c571d',
  name: 'Test name',
  body: 'Test body',
  timestamp: new Date(),
  brand: 'Test brand',
});
const GRAPHQL_CLIENT: Partial<GraphQLClientService> = { updateConfig: jest.fn(), request: jest.fn() };

describe('TargetAppApiService', () => {
  let targetAppApiService: TargetAppApiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: TargetAppApiService,
          useValue: new TargetAppApiService(GRAPHQL_CLIENT as GraphQLClientService),
        },
      ],
    }).compile();

    targetAppApiService = module.get<TargetAppApiService>(TargetAppApiService);
  });

  it('should send extended event using Graphql to Target service successfuly', async () => {
    const spy: jest.SpyInstance = jest.spyOn(GRAPHQL_CLIENT, 'request');
    await targetAppApiService.sendExtendedEvent(EXTENDED_DTO);
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
