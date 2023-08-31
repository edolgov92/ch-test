import { Module } from '@nestjs/common';
import { ClientProviderOptions, ClientsModule } from '@nestjs/microservices';
import { getEnvironmentMicroserviceConfig } from '../common';
import { QUEUE_CLIENT_TOKEN } from './constants';
import * as Controllers from './controllers';

@Module({
  imports: [
    ClientsModule.register([
      {
        ...getEnvironmentMicroserviceConfig(),
        name: QUEUE_CLIENT_TOKEN,
      } as ClientProviderOptions,
    ]),
  ],
  controllers: [Controllers.ProxyHttpController, Controllers.ProxyQueueController],
})
export class ProxyModule {}
