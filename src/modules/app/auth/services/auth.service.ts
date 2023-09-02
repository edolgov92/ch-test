import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Request } from 'express';
import * as RandToken from 'rand-token';
import { AuthConfig, Environment } from '../../../../environment';
import { User, UserSession, UserSessionDto, UserTokenContextDto, WithLogger } from '../../../common';
import { USER_REPOSITORY_TOKEN, UserRepository } from '../../../infra';

@Injectable()
export class AuthService extends WithLogger {
  private authConfig: AuthConfig;

  constructor(
    private configService: ConfigService<Environment>,
    private jwtService: JwtService,
    @Inject(USER_REPOSITORY_TOKEN) private userRepository: UserRepository,
  ) {
    super();
    this.authConfig = this.configService.get('auth');
  }

  async checkSecret(dtoSecret: string, storedSecret: string): Promise<boolean> {
    return dtoSecret === storedSecret || bcrypt.compare(dtoSecret, storedSecret);
  }

  async createUserSession(user: User, ipAddress?: string): Promise<UserSessionDto> {
    const now: Date = new Date();
    const accessTokenExpireDateTime: Date = new Date(now);
    accessTokenExpireDateTime.setSeconds(
      accessTokenExpireDateTime.getSeconds() + this.authConfig.accessTokenExpiresInSec,
    );
    const refreshTokenExpireDateTime: Date = new Date(now);
    refreshTokenExpireDateTime.setSeconds(
      refreshTokenExpireDateTime.getSeconds() + this.authConfig.refreshTokenExpiresInSec,
    );
    const tokenContext: UserTokenContextDto = { id: user.id, authId: user.authId };
    const accessToken: string = this.jwtService.sign(
      { user: tokenContext },
      { secret: this.authConfig.accessTokenSecret, expiresIn: this.authConfig.accessTokenExpiresInSec },
    );
    const refreshToken: string = RandToken.uid(256);
    const userSession: UserSession = new UserSession({
      accessToken,
      accessTokenExpireDateTime,
      ipAddress,
      refreshToken,
      refreshTokenExpireDateTime,
      startDateTime: now,
      userId: user.id,
    });
    await this.userRepository.saveUserSession(userSession);
    return new UserSessionDto({
      accessToken,
      accessTokenExpireDateTime,
      id: userSession.id,
      refreshToken,
      refreshTokenExpireDateTime,
      startDateTime: now,
    });
  }

  async invalidateRefreshToken(userSession: UserSession): Promise<void> {
    userSession.refreshTokenExpireDateTime = new Date();
    await this.userRepository.saveUserSession(userSession);
  }

  getUserIpAddress(request: Request): string | undefined {
    if (!request) {
      return undefined;
    }
    // If the request passed through a proxy, the original IP address would be stored in 'x-forwarded-for' header
    const forwardedIp: string | undefined = request.headers?.['x-forwarded-for'] as string;
    return forwardedIp || request.ip;
  }
}
