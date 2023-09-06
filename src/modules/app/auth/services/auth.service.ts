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

  /**
   * Validates user's secret based on encrypted secret from storage
   * @param {String} dtoSecret - secret from request DTO
   * @param {Request} storedSecret - secret from storage
   * @returns {Boolean} - boolean indicating if secrets the same or not
   */
  async checkSecret(dtoSecret: string, storedSecret: string): Promise<boolean> {
    return dtoSecret === storedSecret || bcrypt.compare(dtoSecret, storedSecret);
  }

  /**
   * Creates session for user with access and refresh tokens
   * @param {User} user - user entity
   * @param {Request} ipAddress - IP address of user client (optional)
   * @returns {UserSessionDto} - user session with access and refresh tokens
   */
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
    await this.userRepository.createUserSession(userSession);
    return new UserSessionDto({
      accessToken,
      accessTokenExpireDateTime,
      id: userSession.id,
      refreshToken,
      refreshTokenExpireDateTime,
      startDateTime: now,
    });
  }

  /**
   * Invalidates refresh token by updating it's expire date and time to now
   * @param {UserSession} userSession - user session
   */
  async invalidateRefreshToken(userSession: UserSession): Promise<void> {
    userSession.refreshTokenExpireDateTime = new Date();
    await this.userRepository.updateUserSession(userSession, {
      refreshTokenExpireDateTime: userSession.refreshTokenExpireDateTime,
    });
  }

  /**
   * Extracts user IP address from HTTP request
   * @param {Request} request - HTTP request
   * @returns {String | undefined} - user IP address
   */
  getUserIpAddress(request: Request): string | undefined {
    if (!request) {
      return undefined;
    }
    // If the request passed through a proxy, the original IP address would be stored in 'x-forwarded-for' header
    const forwardedIp: string | undefined = request.headers?.['x-forwarded-for'] as string;
    return forwardedIp || request.ip;
  }
}
