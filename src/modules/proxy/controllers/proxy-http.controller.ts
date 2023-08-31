import { Body, Controller, HttpCode, HttpStatus, Inject, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiResponse } from '@nestjs/swagger';
import { BaseEventDto, QueueEvent, WithLogger } from '../../common';
import { QUEUE_CLIENT_TOKEN } from '../constants';

@Controller('events')
export class ProxyHttpController extends WithLogger {
  constructor(@Inject(QUEUE_CLIENT_TOKEN) private client: ClientProxy) {
    super();
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Handle source app events',
    type: BaseEventDto,
  })
  async handleEvent(@Body() baseDto: BaseEventDto): Promise<void> {
    this.logger.debug(`Received base event to handle in REST API, event data: ${baseDto}`);
    this.client.emit(QueueEvent.BaseEventReceived, baseDto);
  }
}
