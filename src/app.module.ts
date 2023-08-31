import { Module } from '@nestjs/common';
import { ProxyModule } from './modules';

@Module({
  imports: [ProxyModule],
})
export class AppModule {}
