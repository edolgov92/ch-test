import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UserRepositoryModule } from '../../infra';
import * as Controllers from './controllers';
import * as Services from './services';
import * as Strategies from './strategies';

@Module({
  imports: [JwtModule.register({}), UserRepositoryModule],
  controllers: [Controllers.AuthHttpController],
  providers: [Strategies.JwtStrategy, Services.AuthService],
})
export class AuthModule {}
