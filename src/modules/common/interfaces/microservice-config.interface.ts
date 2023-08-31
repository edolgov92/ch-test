import { Transport } from '@nestjs/microservices';

export interface MicroserviceConfig<T extends object = any> {
  transport: Transport;
  options?: T;
}
