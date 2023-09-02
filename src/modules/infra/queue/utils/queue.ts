import { ConfigService } from '@nestjs/config';
import { Environment, QueueConfig } from '../../../../environment';
import { QueueType } from '../../../common';
import { AbstractTransport } from '../classes';
import { MICROSERVICE_TRANSPORTS_MAP } from '../constants';
import { MicroserviceClientConfig, MicroserviceStrategyConfig } from '../interfaces';
import { TransportConstructor } from '../types';

const TRANSPORT_TYPES_MAP: Map<QueueType, AbstractTransport> = new Map();

function getTransport(configService: ConfigService<Environment>): AbstractTransport {
  const queueConfig: QueueConfig = configService.get('queue');
  let transport: AbstractTransport = TRANSPORT_TYPES_MAP.get(queueConfig.type);
  if (!transport) {
    const transportType: TransportConstructor = MICROSERVICE_TRANSPORTS_MAP.get(queueConfig.type);
    transport = new transportType(configService);
    TRANSPORT_TYPES_MAP.set(queueConfig.type, transport);
  }
  return transport;
}

export function getMicroserviceClientEnvironmentConfig(
  configService: ConfigService<Environment>,
): MicroserviceClientConfig {
  const transport: AbstractTransport = getTransport(configService);
  return transport.getClientConfig();
}

export function getMicroserviceStrategyEnvironmentConfig(
  configService: ConfigService<Environment>,
): MicroserviceStrategyConfig {
  const transport: AbstractTransport = getTransport(configService);
  return transport.getStrategyConfig();
}
