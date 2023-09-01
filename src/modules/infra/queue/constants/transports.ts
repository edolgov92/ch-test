import { QueueType } from '../enums';
import { InMemoryTransport, KafkaTransport } from '../transports';
import { TransportConstructor } from '../types';

export const MICROSERVICE_TRANSPORTS_MAP: Map<QueueType, TransportConstructor> = new Map([
  [QueueType.InMemory, InMemoryTransport],
  [QueueType.Kafka, KafkaTransport],
] as Array<[QueueType, TransportConstructor]>);
