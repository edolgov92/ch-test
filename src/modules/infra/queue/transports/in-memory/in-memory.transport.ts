import { AbstractTransport } from '../../classes';
import { MicroserviceClientConfig, MicroserviceStrategyConfig } from '../../interfaces';
import { InMemoryClient } from './in-memory.client';
import { InMemoryTransportStrategy } from './in-memory.strategy';

export class InMemoryTransport extends AbstractTransport {
  private clientConfig: MicroserviceClientConfig = {
    customClass: InMemoryClient,
  };

  private strategyConfig: MicroserviceStrategyConfig;

  /**
   * Returns microservice client config for In-Memory message broker configuration
   * @returns {MicroserviceClientConfig} - configuration for In-Memory message broker client
   */
  getClientConfig(): MicroserviceClientConfig {
    return this.clientConfig;
  }

  /**
   * Returns microservice strategy config for In-Memory message broker configuration
   * @returns {MicroserviceStrategyConfig} - configuration for In-Memory message broker strategy
   */
  getStrategyConfig(): MicroserviceStrategyConfig {
    if (!this.strategyConfig) {
      this.strategyConfig = {
        strategy: new InMemoryTransportStrategy(),
      };
    }
    return this.strategyConfig;
  }
}
