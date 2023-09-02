import { ConfigService } from '@nestjs/config';
import { Environment, QueueConfig } from '../../../../../../src/environment';
import {
  MICROSERVICE_TRANSPORTS_MAP,
  MicroserviceClientConfig,
  MicroserviceStrategyConfig,
  QueueType,
} from '../../../../../../src/modules';
import { AbstractTransport } from '../../../../../../src/modules/infra/queue/classes';
import { getTransport, TRANSPORT_TYPES_MAP } from '../../../../../../src/modules/infra/queue/utils';

class FakeTransport extends AbstractTransport {
  getClientConfig(): MicroserviceClientConfig {
    return {};
  }
  getStrategyConfig(): MicroserviceStrategyConfig {
    return {};
  }
}

describe('getTransport', () => {
  let configService: Partial<ConfigService<Environment>>;
  const queueConfig: Partial<QueueConfig> = {
    type: 'FakeType' as QueueType,
  };

  beforeEach(() => {
    configService = {
      get: jest.fn().mockReturnValue(queueConfig),
    };
    MICROSERVICE_TRANSPORTS_MAP.clear();
    TRANSPORT_TYPES_MAP.clear();
  });

  it('should instantiate a new transport if it does not exist in the map', () => {
    MICROSERVICE_TRANSPORTS_MAP.set(queueConfig.type, FakeTransport);
    const transport: AbstractTransport = getTransport(configService as ConfigService<Environment>);
    expect(transport).toBeInstanceOf(FakeTransport);
    expect(TRANSPORT_TYPES_MAP.get(queueConfig.type)).toBe(transport);
  });

  it('should return existing transport from the map if it exists', () => {
    const existingTransport: FakeTransport = new FakeTransport();
    TRANSPORT_TYPES_MAP.set(queueConfig.type, existingTransport);
    const transport: AbstractTransport = getTransport(configService as ConfigService<Environment>);
    expect(transport).toBe(existingTransport);
  });
});
