import { ConfigService } from '@nestjs/config';
import { Environment } from '../../../../environment';
import { AbstractTransport } from '../classes';

export type TransportConstructor = { new (configService: ConfigService<Environment>): AbstractTransport };
