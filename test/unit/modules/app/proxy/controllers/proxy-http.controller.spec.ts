import { ClientProxy } from '@nestjs/microservices';
import { Test, TestingModule } from '@nestjs/testing';
import { ProxyHttpController } from '../../../../../../src/modules/app/proxy/controllers';
import { BaseEventDto, UserTokenContextDto } from '../../../../../../src/modules/common';
import { QUEUE_CLIENT_TOKEN } from '../../../../../../src/modules/infra';

const BASE_DTO: BaseEventDto = new BaseEventDto({
  id: 'b33bad7c-837d-4a5b-9f56-20d46f5c571d',
  name: 'Test name',
  body: 'Test body',
  timestamp: new Date(),
});
const USER_TOKEN_CONTEXT_DTO: UserTokenContextDto = new UserTokenContextDto({
  id: 'usr_5Qv1ARJMWJnD1hTdbNgiQf',
  authId: 'source_user',
});

describe('ProxyHttpController', () => {
  let proxyHttpController: ProxyHttpController;
  let queueClient: Partial<ClientProxy>;

  beforeEach(async () => {
    queueClient = { emit: jest.fn() };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProxyHttpController],
      providers: [
        {
          provide: QUEUE_CLIENT_TOKEN,
          useValue: queueClient,
        },
      ],
    }).compile();

    proxyHttpController = module.get<ProxyHttpController>(ProxyHttpController);
  });

  it('should emit BaseEventReceived queue event', async () => {
    await proxyHttpController.handleEvent(BASE_DTO, USER_TOKEN_CONTEXT_DTO);
    expect(queueClient.emit).toHaveBeenCalledTimes(1);
  });
});
