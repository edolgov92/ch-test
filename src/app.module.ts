import { Module } from '@nestjs/common';
import { AuthModule, ProxyModule } from './modules';

@Module({
  imports: [AuthModule, ProxyModule],
})
export class AppModule {}
