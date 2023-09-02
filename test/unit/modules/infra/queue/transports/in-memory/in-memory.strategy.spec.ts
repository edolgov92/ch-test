import {
  InMemoryClient,
  InMemoryQueueMessage,
  InMemoryTransportStrategy,
} from '../../../../../../../src/modules/infra/queue';

describe('InMemoryTransportStrategy', () => {
  let strategy: InMemoryTransportStrategy;

  beforeEach(() => {
    strategy = new InMemoryTransportStrategy();
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('should subscribe to queue$', async () => {
    const spy: jest.SpyInstance = jest.spyOn(InMemoryClient.queue$, 'subscribe');
    await strategy.listen(() => {});
    expect(spy).toHaveBeenCalled();
  });

  it('should handle incoming messages based on pattern', async () => {
    const mockHandler = jest.fn();
    (strategy as any).messageHandlers = new Map();
    (strategy as any).messageHandlers.set('testPattern', mockHandler);

    await strategy.listen(() => {});
    const message: InMemoryQueueMessage = {
      pattern: 'testPattern',
      data: 'testData',
    };

    InMemoryClient.queue$.next(message);

    expect(mockHandler).toHaveBeenCalledWith('testData');
  });

  it('should have an empty close method', async () => {
    await expect(strategy.close()).resolves.toBeUndefined();
  });

  it('should have an empty bindEvents method', async () => {
    await expect(strategy.bindEvents()).resolves.toBeUndefined();
  });
});
