import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthConfig, Environment } from '../../../../environment';
import { UserTokenContextDto } from '../../../common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService<Environment>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<AuthConfig>('auth').accessTokenSecret,
    });
  }

  async validate(payload: { user: UserTokenContextDto }): Promise<UserTokenContextDto> {
    return payload.user;
  }
}
