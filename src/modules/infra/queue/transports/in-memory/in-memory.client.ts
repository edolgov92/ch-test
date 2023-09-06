import { ClientProxy, ReadPacket } from '@nestjs/microservices';
import { Subject } from 'rxjs';
import { InMemoryQueueMessage } from '../../interfaces';

export class InMemoryClient extends ClientProxy {
  static queue$: Subject<InMemoryQueueMessage> = new Subject();

  async connect() {}

  close() {}

  /**
   * Pushes event to Subject - In-Memory message broker
   * @param {ReadPacket} packet - object with event data and pattern
   */
  async dispatchEvent({ data, pattern }: ReadPacket): Promise<any> {
    InMemoryClient.queue$.next({ pattern, data });
  }

  protected publish(): () => void {
    throw new Error('Method not implemented.');
  }
}
