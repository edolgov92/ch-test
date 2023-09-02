import { ReadPacket } from '@nestjs/microservices';
import { Subject } from 'rxjs';
import { take } from 'rxjs/operators';
import { InMemoryClient } from '../../../../../../../src/modules/infra/queue';

describe('InMemoryClient', () => {
  let inMemoryClient: InMemoryClient;

  beforeEach(() => {
    inMemoryClient = new InMemoryClient();
  });

  it('should initialize an instance', () => {
    expect(inMemoryClient).toBeInstanceOf(InMemoryClient);
  });

  it('should have a static Subject queue$', () => {
    expect(InMemoryClient.queue$).toBeInstanceOf(Subject);
  });

  it('should have an async connect method', async () => {
    await expect(inMemoryClient.connect()).resolves.toBeUndefined();
  });

  it('should have a close method', () => {
    expect(inMemoryClient.close()).toBeUndefined();
  });

  it('should emit an event on queue$', async () => {
    const readPacket: ReadPacket = { data: 'someData', pattern: 'somePattern' };
    const promise: Promise<void> = new Promise((resolve) => {
      InMemoryClient.queue$.pipe(take(1)).subscribe({
        next: (message: ReadPacket) => {
          expect(message).toEqual({ pattern: 'somePattern', data: 'someData' });
          resolve();
        },
      });
    });
    await inMemoryClient.dispatchEvent(readPacket);
    await promise;
  });
});
