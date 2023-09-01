import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Request } from 'express';
import * as RandToken from 'rand-token';
import { environment } from '../../../../environment';
import { User, UserSession, UserSessionDto, UserTokenContextDto, WithLogger } from '../../../common';
import { USER_REPOSITORY_TOKEN, UserRepository } from '../../../infra';

@Injectable()
export class AuthService extends WithLogger {
  constructor(
    private jwtService: JwtService,
    @Inject(USER_REPOSITORY_TOKEN) private userRepository: UserRepository,
  ) {
    super();
  }

  async checkSecret(dtoSecret: string, storedSecret: string): Promise<boolean> {
    return dtoSecret === storedSecret || bcrypt.compare(dtoSecret, storedSecret);
  }

  async createUserSession(user: User, ipAddress?: string): Promise<UserSessionDto> {
    const now: Date = new Date();
    const accessTokenExpireDateTime: Date = new Date(now);
    accessTokenExpireDateTime.setSeconds(
      accessTokenExpireDateTime.getSeconds() + environment.auth.accessTokenExpiresInSec,
    );
    const refreshTokenExpireDateTime: Date = new Date(now);
    refreshTokenExpireDateTime.setSeconds(
      refreshTokenExpireDateTime.getSeconds() + environment.auth.refreshTokenExpiresInSec,
    );
    const tokenContext: UserTokenContextDto = { id: user.id, authId: user.authId };
    const accessToken: string = this.jwtService.sign({ user: tokenContext });
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
    let ip: string | undefined;
    if (request) {
      if (request.headers && request.headers['x-forwarded-for']) {
        ip = request.headers['x-forwarded-for'] as string;
      }
      if (!ip) {
        ip = request.ip;
      }
    }
    return ip;
  }
}
