import { Type } from '@nestjs/common';
import { ClientProxy, CustomTransportStrategy, Transport } from '@nestjs/microservices';

export interface MicroserviceStrategyConfig<T extends object = any> {
  transport?: Transport;
  options?: T;
  strategy?: CustomTransportStrategy;
}

export interface MicroserviceClientConfig<T extends object = any> {
  transport?: Transport;
  options?: T;
  customClass?: Type<ClientProxy>;
}
