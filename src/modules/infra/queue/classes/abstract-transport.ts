import { MicroserviceClientConfig, MicroserviceStrategyConfig } from '../interfaces';

export abstract class AbstractTransport {
  abstract getClientConfig(): MicroserviceClientConfig;
  abstract getStrategyConfig(): MicroserviceStrategyConfig;
}
