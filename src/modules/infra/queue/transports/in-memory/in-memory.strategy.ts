import { CustomTransportStrategy, MessageHandler, Server } from '@nestjs/microservices';
import { InMemoryQueueMessage } from '../../interfaces';
import { InMemoryClient } from './in-memory.client';

export class InMemoryTransportStrategy extends Server implements CustomTransportStrategy {
  /**
   * Listens for data from Subject - In-Memory message broker
   * @param {Function} callback - callback function
   */
  async listen(callback: () => void): Promise<void> {
    InMemoryClient.queue$.subscribe(async (message: InMemoryQueueMessage) => {
      const handlers: Map<string, MessageHandler> = this.getHandlers();
      const messageHandler: MessageHandler | undefined = handlers.get(message.pattern);
      if (!messageHandler) {
        return;
      }
      await messageHandler(message.data);
    });
    callback();
  }

  async close() {}

  async bindEvents() {}
}
