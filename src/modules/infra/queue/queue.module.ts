import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProviderOptions, ClientsModule } from '@nestjs/microservices';
import { Environment } from '../../../environment';
import { QUEUE_CLIENT_TOKEN } from './constants';
import { getMicroserviceClientEnvironmentConfig } from './utils';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        inject: [ConfigService],
        name: QUEUE_CLIENT_TOKEN,
        useFactory: async (configService: ConfigService<Environment>) => {
          return {
            ...getMicroserviceClientEnvironmentConfig(configService),
            name: QUEUE_CLIENT_TOKEN,
          } as ClientProviderOptions;
        },
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class QueueModule {}
