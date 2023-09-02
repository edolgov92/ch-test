import {
  InMemoryClient,
  InMemoryTransport,
  InMemoryTransportStrategy,
  MicroserviceClientConfig,
  MicroserviceStrategyConfig,
} from '../../../../../../../src/modules/infra/queue';

describe('InMemoryTransport', () => {
  let transport: InMemoryTransport;

  beforeEach(() => {
    transport = new InMemoryTransport();
  });

  it('should return the correct client configuration', () => {
    const expectedConfig: MicroserviceClientConfig = {
      customClass: InMemoryClient,
    };
    const actualConfig: MicroserviceClientConfig = transport.getClientConfig();
    expect(actualConfig).toEqual(expectedConfig);
  });

  it('should return a strategy configuration containing an instance of InMemoryTransportStrategy', () => {
    const strategyConfig: MicroserviceStrategyConfig = transport.getStrategyConfig();
    expect(strategyConfig.strategy).toBeInstanceOf(InMemoryTransportStrategy);
  });

  it('should reuse the strategy configuration if it is already set', () => {
    const firstConfig: MicroserviceStrategyConfig = transport.getStrategyConfig();
    const secondConfig: MicroserviceStrategyConfig = transport.getStrategyConfig();
    expect(firstConfig).toBe(secondConfig);
  });
});
