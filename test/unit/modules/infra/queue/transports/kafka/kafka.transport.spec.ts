import { ConfigService } from '@nestjs/config';
import { Transport } from '@nestjs/microservices';
import { logLevel } from 'kafkajs';
import { ApiConfig, Environment, QueueConfig } from '../../../../../../../src/environment';
import {
  KafkaTransport,
  MicroserviceClientConfig,
  MicroserviceStrategyConfig,
} from '../../../../../../../src/modules';

describe('KafkaTransport', () => {
  let kafkaTransport: KafkaTransport;
  let mockConfigService: Partial<ConfigService<Environment>>;

  beforeEach(() => {
    mockConfigService = {
      get: jest.fn().mockImplementation((key: string) => {
        if (key === 'queue') {
          return { url: 'test-broker' } as QueueConfig;
        }
        if (key === 'containerAppReplicaName') {
          return 'test-client-id';
        }
        if (key === 'api') {
          return { name: 'test-group-id' } as ApiConfig;
        }
        return null;
      }),
    };

    kafkaTransport = new KafkaTransport(mockConfigService as ConfigService<Environment>);
  });

  describe('getClientConfig', () => {
    it('should return the correct Kafka client configuration', () => {
      const expectedConfig: MicroserviceClientConfig = {
        transport: Transport.KAFKA,
        options: {
          client: {
            brokers: ['test-broker'],
            clientId: 'test-client-id',
            logLevel: logLevel.ERROR,
          },
          consumer: {
            groupId: 'test-group-id',
          },
        },
      };
      const actualConfig: MicroserviceClientConfig = kafkaTransport.getClientConfig();
      expect(actualConfig).toEqual(expectedConfig);
    });
  });

  describe('getStrategyConfig', () => {
    it('should return the correct Kafka strategy configuration', () => {
      const expectedConfig: MicroserviceStrategyConfig = {
        transport: Transport.KAFKA,
        options: {
          client: {
            brokers: ['test-broker'],
            clientId: 'test-client-id',
            logLevel: logLevel.ERROR,
          },
          consumer: {
            groupId: 'test-group-id',
          },
        },
      };
      const actualConfig: MicroserviceStrategyConfig = kafkaTransport.getStrategyConfig();
      expect(actualConfig).toEqual(expectedConfig);
    });
  });
});
