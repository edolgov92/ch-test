import { Test, TestingModule } from '@nestjs/testing';
import { ProxyHttpController } from '../../../../../../src/modules/app/proxy/controllers';
import { BaseEventDto } from '../../../../../../src/modules/common';
import { QUEUE_CLIENT_TOKEN } from '../../../../../../src/modules/infra';

const BASE_DTO: BaseEventDto = new BaseEventDto({
  id: 'b33bad7c-837d-4a5b-9f56-20d46f5c571d',
  name: 'Test name',
  body: 'Test body',
  timestamp: new Date(),
});
const QUEUE_CLIENT = { emit: jest.fn() };

describe('ProxyHttpController', () => {
  let proxyHttpController: ProxyHttpController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProxyHttpController],
      providers: [
        {
          provide: QUEUE_CLIENT_TOKEN,
          useValue: QUEUE_CLIENT,
        },
      ],
    }).compile();

    proxyHttpController = module.get<ProxyHttpController>(ProxyHttpController);
  });

  it('should emit BaseEventReceived queue event', async () => {
    const spy: jest.SpyInstance = jest.spyOn(QUEUE_CLIENT, 'emit');
    await proxyHttpController.handleEvent(BASE_DTO);
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
