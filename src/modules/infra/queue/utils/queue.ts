import { environment } from '../../../../environment';
import { AbstractTransport } from '../classes';
import { MICROSERVICE_TRANSPORTS_MAP } from '../constants';
import { QueueType } from '../enums';
import { MicroserviceClientConfig, MicroserviceStrategyConfig } from '../interfaces';
import { TransportConstructor } from '../types';

const TRANSPORT_TYPES_MAP: Map<QueueType, AbstractTransport> = new Map();

function getTransport(): AbstractTransport {
  let transport: AbstractTransport = TRANSPORT_TYPES_MAP.get(environment.queue.type);
  if (!transport) {
    const transportType: TransportConstructor = MICROSERVICE_TRANSPORTS_MAP.get(environment.queue.type);
    transport = new transportType();
    TRANSPORT_TYPES_MAP.set(environment.queue.type, transport);
  }
  return transport;
}

export function getMicroserviceClientEnvironmentConfig(): MicroserviceClientConfig {
  const transport: AbstractTransport = getTransport();
  return transport.getClientConfig();
}

export function getMicroserviceStrategyEnvironmentConfig(): MicroserviceStrategyConfig {
  const transport: AbstractTransport = getTransport();
  return transport.getStrategyConfig();
}
