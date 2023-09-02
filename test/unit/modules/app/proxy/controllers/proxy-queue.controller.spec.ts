import { ClientProxy } from '@nestjs/microservices';
import { Test, TestingModule } from '@nestjs/testing';
import { ProxyQueueController } from '../../../../../../src/modules/app/proxy/controllers';
import { TargetAppApiService } from '../../../../../../src/modules/app/proxy/services';
import { BaseEventDto, ExtendedEventDto } from '../../../../../../src/modules/common';
import { QUEUE_CLIENT_TOKEN } from '../../../../../../src/modules/infra';

const BASE_DTO: BaseEventDto = new BaseEventDto({
  id: 'b33bad7c-837d-4a5b-9f56-20d46f5c571d',
  name: 'Test name',
  body: 'Test body',
  timestamp: new Date(),
});

describe('ProxyQueueController', () => {
  let proxyQueueController: ProxyQueueController;
  let queueClient: Partial<ClientProxy>;
  let targetAppApiService: Partial<TargetAppApiService>;

  beforeEach(async () => {
    queueClient = { connect: jest.fn(), close: jest.fn() };
    targetAppApiService = { sendExtendedEvent: jest.fn() };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProxyQueueController],
      providers: [
        {
          provide: QUEUE_CLIENT_TOKEN,
          useValue: queueClient,
        },
        {
          provide: TargetAppApiService,
          useValue: targetAppApiService,
        },
      ],
    }).compile();

    proxyQueueController = module.get<ProxyQueueController>(ProxyQueueController);
  });

  it('should call sendExtendedEvent method from TargetAppApiService while handling event', async () => {
    await proxyQueueController.handleEvent(BASE_DTO);
    expect(targetAppApiService.sendExtendedEvent).toHaveBeenCalledTimes(1);
  });

  it('should add brand property to dto while handling event', async () => {
    await proxyQueueController.handleEvent(BASE_DTO);
    expect(targetAppApiService.sendExtendedEvent).toHaveBeenCalledWith(
      new ExtendedEventDto({ ...BASE_DTO, brand: 'Test brand' }),
    );
  });

  it('should call client connect on module init', async () => {
    proxyQueueController.onModuleInit();
    expect(queueClient.connect).toHaveBeenCalledTimes(1);
  });

  it('should call client close on module destroy', async () => {
    proxyQueueController.onModuleDestroy();
    expect(queueClient.close).toHaveBeenCalledTimes(1);
  });
});
