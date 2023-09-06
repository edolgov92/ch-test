import { ConfigService } from '@nestjs/config';
import { Environment, QueueConfig } from '../../../../environment';
import { QueueType } from '../../../common';
import { AbstractTransport } from '../classes';
import { MICROSERVICE_TRANSPORTS_MAP } from '../constants';
import { MicroserviceClientConfig, MicroserviceStrategyConfig } from '../interfaces';
import { TransportConstructor } from '../types';

export const TRANSPORT_TYPES_MAP: Map<QueueType, AbstractTransport> = new Map();

/**
 * Returns transport instance for message broker
 * @param {ConfigService<Environment>} configService - service with environment variables
 * @returns {AbstractTransport} - instance of AbstractTransport
 */
export function getTransport(configService: ConfigService<Environment>): AbstractTransport {
  const queueConfig: QueueConfig = configService.get('queue');
  let transport: AbstractTransport = TRANSPORT_TYPES_MAP.get(queueConfig.type);
  if (!transport) {
    const transportType: TransportConstructor = MICROSERVICE_TRANSPORTS_MAP.get(queueConfig.type);
    transport = new transportType(configService);
    TRANSPORT_TYPES_MAP.set(queueConfig.type, transport);
  }
  return transport;
}

/**
 * Returns microservice client config based on message broker type from environment variables
 * @param {ConfigService<Environment>} configService - service with environment variables
 * @returns {MicroserviceClientConfig} - configuration for message broker client
 */
export function getMicroserviceClientEnvironmentConfig(
  configService: ConfigService<Environment>,
): MicroserviceClientConfig {
  const transport: AbstractTransport = getTransport(configService);
  return transport.getClientConfig();
}

/**
 * Returns microservice strategy config based on message broker type from environment variables
 * @param {ConfigService<Environment>} configService - service with environment variables
 * @returns {MicroserviceStrategyConfig} - configuration for message broker strategy
 */
export function getMicroserviceStrategyEnvironmentConfig(
  configService: ConfigService<Environment>,
): MicroserviceStrategyConfig {
  const transport: AbstractTransport = getTransport(configService);
  return transport.getStrategyConfig();
}
