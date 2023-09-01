import { ClientProxy, ReadPacket } from '@nestjs/microservices';
import { Subject } from 'rxjs';
import { InMemoryQueueMessage } from '../../interfaces';

export class InMemoryClient extends ClientProxy {
  static queue$: Subject<InMemoryQueueMessage> = new Subject();

  async connect() {}

  close() {}

  async dispatchEvent({ data, pattern }: ReadPacket): Promise<any> {
    InMemoryClient.queue$.next({ pattern, data });
  }

  protected publish(): () => void {
    throw new Error('Method not implemented.');
  }
}
