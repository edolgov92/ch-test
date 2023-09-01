import { Body, Controller, HttpCode, HttpStatus, Inject, Post, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { BaseEventDto, QueueEvent, UserTokenContextDto, WithLogger } from '../../../common';
import { QUEUE_CLIENT_TOKEN } from '../../../infra';
import { UserTokenContext } from '../../auth';
import { JwtAuthGuard } from '../../auth/guards';

@Controller('events')
export class ProxyHttpController extends WithLogger {
  constructor(@Inject(QUEUE_CLIENT_TOKEN) private client: ClientProxy) {
    super();
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Handle source app events',
    type: BaseEventDto,
  })
  async handleEvent(
    @Body() baseDto: BaseEventDto,
    @UserTokenContext() userDto: UserTokenContextDto,
  ): Promise<void> {
    this.logger.debug(
      `Received base event from user ${userDto?.authId} (${userDto?.id}) to handle in ` +
        `REST API, event data: ${baseDto}`,
    );
    this.client.emit(QueueEvent.BaseEventReceived, baseDto);
  }
}
