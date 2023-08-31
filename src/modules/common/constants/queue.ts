import { Transport } from '@nestjs/microservices';
import { ConsumerConfig, KafkaConfig, logLevel } from 'kafkajs';
import { environment } from '../../../environment';
import { QueueType } from '../enums';
import { MicroserviceConfig } from '../interfaces';

export const KAFKA_CONFIG: MicroserviceConfig = {
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

export const MICROSERVICE_CONFIGS_MAP: Map<QueueType, MicroserviceConfig> = new Map([
  [QueueType.Kafka, KAFKA_CONFIG],
]);
