import { Module } from '@nestjs/common';
import { ClientProviderOptions, ClientsModule } from '@nestjs/microservices';
import { QUEUE_CLIENT_TOKEN } from './constants';
import { getMicroserviceClientEnvironmentConfig } from './utils';

@Module({
  imports: [
    ClientsModule.register([
      {
        ...getMicroserviceClientEnvironmentConfig(),
        name: QUEUE_CLIENT_TOKEN,
      } as ClientProviderOptions,
    ]),
  ],
  exports: [ClientsModule],
})
export class QueueModule {}
