import { AbstractTransport } from '../../classes';
import { MicroserviceClientConfig, MicroserviceStrategyConfig } from '../../interfaces';
import { InMemoryClient } from './in-memory.client';
import { InMemoryTransportStrategy } from './in-memory.strategy';

export class InMemoryTransport extends AbstractTransport {
  private static clientConfig: MicroserviceClientConfig = {
    customClass: InMemoryClient,
  };

  private static strategyConfig: MicroserviceStrategyConfig;

  getClientConfig(): MicroserviceClientConfig {
    return InMemoryTransport.clientConfig;
  }

  getStrategyConfig(): MicroserviceStrategyConfig {
    if (!InMemoryTransport.strategyConfig) {
      InMemoryTransport.strategyConfig = {
        strategy: new InMemoryTransportStrategy(),
      };
    }
    return InMemoryTransport.strategyConfig;
  }
}
