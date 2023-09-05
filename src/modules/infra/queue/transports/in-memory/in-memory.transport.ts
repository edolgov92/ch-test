import { AbstractTransport } from '../../classes';
import { MicroserviceClientConfig, MicroserviceStrategyConfig } from '../../interfaces';
import { InMemoryClient } from './in-memory.client';
import { InMemoryTransportStrategy } from './in-memory.strategy';

export class InMemoryTransport extends AbstractTransport {
  private clientConfig: MicroserviceClientConfig = {
    customClass: InMemoryClient,
  };

  private strategyConfig: MicroserviceStrategyConfig;

  getClientConfig(): MicroserviceClientConfig {
    return this.clientConfig;
  }

  getStrategyConfig(): MicroserviceStrategyConfig {
    if (!this.strategyConfig) {
      this.strategyConfig = {
        strategy: new InMemoryTransportStrategy(),
      };
    }
    return this.strategyConfig;
  }
}
