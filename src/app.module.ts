import { Module } from '@nestjs/common';
import { AuthModule, ProxyModule, SourceModule } from './modules';

@Module({
  imports: [AuthModule, ProxyModule, SourceModule],
})
export class AppModule {}
