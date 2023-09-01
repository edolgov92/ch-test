import { Test, TestingModule } from '@nestjs/testing';
import { BaseEventDto, ExtendedEventDto } from '../../../../../src/modules/common';
import { ProxyQueueController } from '../../../../../src/modules/proxy/controllers';
import { TargetAppApiService } from '../../../../../src/modules/proxy/services';
import { QUEUE_CLIENT_TOKEN } from '../../../../../src/modules/queue';

const BASE_DTO: BaseEventDto = new BaseEventDto({
  id: 'b33bad7c-837d-4a5b-9f56-20d46f5c571d',
  name: 'Test name',
  body: 'Test body',
  timestamp: new Date(),
});
const QUEUE_CLIENT = { connect: jest.fn(), close: jest.fn() };
const TARGET_APP_API_SERVICE = { sendExtendedEvent: jest.fn() };

describe('ProxyHttpController', () => {
  let proxyQueueController: ProxyQueueController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProxyQueueController],
      providers: [
        {
          provide: QUEUE_CLIENT_TOKEN,
          useValue: QUEUE_CLIENT,
        },
        {
          provide: TargetAppApiService,
          useValue: TARGET_APP_API_SERVICE,
        },
      ],
    }).compile();
    proxyQueueController = module.get<ProxyQueueController>(ProxyQueueController);
  });

  it('should call sendExtendedEvent method from TargetAppApiService while handling event', async () => {
    const spy: jest.SpyInstance = jest.spyOn(TARGET_APP_API_SERVICE, 'sendExtendedEvent');
    await proxyQueueController.handleEvent(BASE_DTO);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should add brand property to dto while handling event', async () => {
    const spy: jest.SpyInstance = jest.spyOn(TARGET_APP_API_SERVICE, 'sendExtendedEvent');
    await proxyQueueController.handleEvent(BASE_DTO);
    expect(spy).toHaveBeenCalledWith(new ExtendedEventDto({ ...BASE_DTO, brand: 'Test brand' }));
  });
});
