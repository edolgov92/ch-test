import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { environment } from './environment';
import { AuthModule, ProxyModule, SourceModule } from './modules';

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [() => environment],
    }),
    ProxyModule,
    SourceModule,
  ],
})
export class AppModule {}
