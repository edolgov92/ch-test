import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { environment } from '../../../../environment';
import { UserTokenContextDto } from '../../../common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: environment.auth.accessTokenSecret,
    });
  }

  async validate(payload: { user: UserTokenContextDto }): Promise<UserTokenContextDto> {
    return payload.user;
  }
}
