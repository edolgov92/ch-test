import { Transport } from '@nestjs/microservices';
import { ConsumerConfig, KafkaConfig, logLevel } from 'kafkajs';
import { environment } from '../../../../environment';
import { AbstractTransport } from '../../classes';
import { MicroserviceClientConfig, MicroserviceStrategyConfig } from '../../interfaces';

export class KafkaTransport extends AbstractTransport {
  private static config: MicroserviceStrategyConfig = {
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: [environment.queue.url],
        clientId: environment.containerAppReplicaName,
        logLevel: logLevel.ERROR,
      } as KafkaConfig,
      consumer: {
        groupId: environment.api.name,
      } as ConsumerConfig,
    },
  };

  getClientConfig(): MicroserviceClientConfig {
    return KafkaTransport.config;
  }

  getStrategyConfig(): MicroserviceStrategyConfig {
    return KafkaTransport.config;
  }
}
