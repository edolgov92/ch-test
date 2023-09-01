import { Test } from '@nestjs/testing';
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

describe('TargetAppApiService', () => {
  let graphQLClientService: Partial<GraphQLClientService>;
  let targetAppApiService: TargetAppApiService;

  beforeEach(async () => {
    graphQLClientService = { setConfig: jest.fn(), request: jest.fn() };
    targetAppApiService = new TargetAppApiService(graphQLClientService as GraphQLClientService);
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
