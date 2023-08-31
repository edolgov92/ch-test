import { environment } from '../../../environment';
import { MICROSERVICE_CONFIGS_MAP } from '../constants';
import { QueueType } from '../enums';
import { MicroserviceConfig } from '../interfaces';

export function getEnvironmentMicroserviceConfig(): MicroserviceConfig {
  return MICROSERVICE_CONFIGS_MAP.get(environment.queue.type as QueueType);
}
