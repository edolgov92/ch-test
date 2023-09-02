import { ConfigService } from '@nestjs/config';
import { Transport } from '@nestjs/microservices';
import { ConsumerConfig, KafkaConfig, logLevel } from 'kafkajs';
import { ApiConfig, Environment, QueueConfig } from '../../../../../environment';
import { AbstractTransport } from '../../classes';
import { MicroserviceClientConfig, MicroserviceStrategyConfig } from '../../interfaces';

export class KafkaTransport extends AbstractTransport {
  private config: MicroserviceStrategyConfig;

  constructor(private configService: ConfigService<Environment>) {
    super();

    this.config = {
      transport: Transport.KAFKA,
      options: {
        client: {
          brokers: [this.configService.get<QueueConfig>('queue').url],
          clientId: this.configService.get('containerAppReplicaName'),
          logLevel: logLevel.ERROR,
        } as KafkaConfig,
        consumer: {
          groupId: this.configService.get<ApiConfig>('api').name,
        } as ConsumerConfig,
      },
    };
  }

  getClientConfig(): MicroserviceClientConfig {
    return this.config;
  }

  getStrategyConfig(): MicroserviceStrategyConfig {
    return this.config;
  }
}
