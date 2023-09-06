import { Controller, Inject, UsePipes, ValidationPipe } from '@nestjs/common';
import { ClientProxy, MessagePattern, Payload } from '@nestjs/microservices';
import { BaseEventDto, ExtendedEventDto, QueueEvent, WithLogger } from '../../../common';
import { QUEUE_CLIENT_TOKEN } from '../../../infra';
import { TargetAppApiService } from '../services';

@Controller()
export class ProxyQueueController extends WithLogger {
  constructor(
    @Inject(QUEUE_CLIENT_TOKEN) private client: ClientProxy,
    private targetAppApiService: TargetAppApiService,
  ) {
    super();
  }

  /**
   * Calls while initializing of module and connects to message broker
   */
  async onModuleInit(): Promise<void> {
    await this.client.connect();
  }

  /**
   * Calles while destroying of module and closes message broker connection
   */
  onModuleDestroy(): void {
    this.client.close();
  }

  /**
   * Handles base event received from message broker, extends it and sends to Target service
   * @param {BaseEventDto} baseDto - base event data
   */
  @UsePipes(new ValidationPipe({ transform: true }))
  @MessagePattern(QueueEvent.BaseEventReceived)
  async handleEvent(@Payload() baseDto: BaseEventDto): Promise<void> {
    this.logger.debug(
      `${baseDto.id} | Received based event to handle from QUEUE, event data: ${JSON.stringify(baseDto)}`,
    );
    const extendedDto: ExtendedEventDto = new ExtendedEventDto({
      ...baseDto,
      brand: 'Test brand',
    });
    this.logger.debug(`${baseDto.id} | Added brand ${extendedDto.brand} to dto data`);
    await this.targetAppApiService.sendExtendedEvent(extendedDto);
  }
}
