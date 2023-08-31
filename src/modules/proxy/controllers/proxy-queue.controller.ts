import { Controller, Inject, UsePipes, ValidationPipe } from '@nestjs/common';
import { ClientProxy, MessagePattern, Payload } from '@nestjs/microservices';
import { BaseEventDto, ExtendedEventDto, QueueEvent, WithLogger } from '../../common';
import { QUEUE_CLIENT_TOKEN } from '../constants';

@Controller()
export class ProxyQueueController extends WithLogger {
  constructor(@Inject(QUEUE_CLIENT_TOKEN) private client: ClientProxy) {
    super();
  }

  async onModuleInit() {
    this.logger.debug('Queue client is connecting');
    await this.client.connect();
    this.logger.debug('Queue client was connected');
  }

  async onModuleDestroy() {
    this.logger.debug('Closing connection in queue client');
    this.client.close();
  }

  @UsePipes(new ValidationPipe({ transform: true }))
  @MessagePattern(QueueEvent.BaseEventReceived)
  handleEvent(@Payload() baseDto: BaseEventDto): void {
    this.logger.debug(`Received based event to handle from QUEUE, event data: ${JSON.stringify(baseDto)}`);
    const extendedDto: ExtendedEventDto = new ExtendedEventDto({
      ...baseDto,
      brand: 'testBrand',
    });
    this.logger.debug(`Added brand ${extendedDto.brand} to dto data`);
  }
}
