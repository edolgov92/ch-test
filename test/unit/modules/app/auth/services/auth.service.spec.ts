import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';
import * as RandToken from 'rand-token';
import { Environment } from '../../../../../../src/environment';
import {
  User,
  USER_REPOSITORY_TOKEN,
  UserRepository,
  UserSession,
  UserSessionDto,
} from '../../../../../../src/modules';
import { AuthService } from '../../../../../../src/modules/app/auth/services';

const CONFIG_SERVICE: Partial<ConfigService<Environment>> = {
  get: jest.fn().mockReturnValue({
    accessTokenExpiresInSec: 30,
    refreshTokenExpiresInSec: 60,
  }),
};
const USER: User = new User({
  authId: 'source_user',
  secret: '$2b$10$59D08dqnE0NS7J09QjjdjuJAuIkEhyv35u00oWDFT1d2aqQFHjrRm',
});
const USER_DTO_SECRET: string = 'timbRIanorSo';
const USER_STORED_SECRET: string = '$2b$10$59D08dqnE0NS7J09QjjdjuJAuIkEhyv35u00oWDFT1d2aqQFHjrRm';

const ACCESS_TOKEN_EXPIRE_DATE_TIME: Date = new Date();
ACCESS_TOKEN_EXPIRE_DATE_TIME.setHours(ACCESS_TOKEN_EXPIRE_DATE_TIME.getHours() + 1);
const REFRESH_TOKEN_EXPIRE_DATE_TIME: Date = new Date(ACCESS_TOKEN_EXPIRE_DATE_TIME);
REFRESH_TOKEN_EXPIRE_DATE_TIME.setHours(REFRESH_TOKEN_EXPIRE_DATE_TIME.getHours() + 1);

const USER_SESSION: UserSession = new UserSession({
  accessToken:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoidXNyXzVRdjFBUkpNV0puRDFoVGRiTmdpUWYiLCJhdXRoSWQiOiJzb3VyY2VfdXNlciJ9LCJpYXQiOjE2OTM1NzY2OTgsImV4cCI6MTY5MzU3NjcyOH0.8pLUCLtLi_bcFQTX7LhxGWw67EzkeBzODzWCXjpzcoU',
  accessTokenExpireDateTime: ACCESS_TOKEN_EXPIRE_DATE_TIME,
  ipAddress: '66.249.70.192',
  refreshToken: RandToken.uid(256),
  refreshTokenExpireDateTime: REFRESH_TOKEN_EXPIRE_DATE_TIME,
  startDateTime: new Date(),
  userId: USER.id,
});

describe('AuthService', () => {
  let authService: AuthService;
  let jwtService: Partial<JwtService>;
  let userRepository: Partial<UserRepository>;

  beforeEach(async () => {
    jwtService = { sign: jest.fn().mockReturnValue(USER_SESSION.accessToken) };
    userRepository = { saveUserSession: jest.fn() };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: ConfigService,
          useValue: CONFIG_SERVICE,
        },
        {
          provide: JwtService,
          useValue: jwtService,
        },
        {
          provide: USER_REPOSITORY_TOKEN,
          useValue: userRepository,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  it('should return true from checkSecret if secrets are the same', async () => {
    const result: boolean = await authService.checkSecret(USER_DTO_SECRET, USER_STORED_SECRET);
    expect(result).toBeTruthy();
  });

  it('should return false from checkSecret if secrets are different', async () => {
    const result: boolean = await authService.checkSecret(USER_DTO_SECRET, USER_STORED_SECRET + '1');
    expect(result).toBeFalsy();
  });

  it('should create user session', async () => {
    const dto: UserSessionDto = await authService.createUserSession(USER, USER_SESSION.ipAddress);
    const now: number = Date.now();
    expect(dto).toBeInstanceOf(UserSessionDto);
    expect(dto.accessToken).toBe(USER_SESSION.accessToken);
    expect(dto.accessTokenExpireDateTime).toBeInstanceOf(Date);
    expect(dto.accessTokenExpireDateTime.getTime()).toBeGreaterThan(now);
    expect(typeof dto.id).toBe('string');
    expect(dto.id.startsWith('uss_')).toBeTruthy();
    expect(typeof dto.refreshToken).toBe('string');
    expect(dto.refreshToken.length).toBe(256);
    expect(dto.refreshTokenExpireDateTime).toBeInstanceOf(Date);
    expect(dto.refreshTokenExpireDateTime.getTime()).toBeGreaterThan(now);
    expect(dto.refreshTokenExpireDateTime.getTime()).toBeGreaterThan(dto.accessTokenExpireDateTime.getTime());
    expect(dto.startDateTime).toBeInstanceOf(Date);
    expect(dto.startDateTime.getTime()).toBeLessThanOrEqual(now);
  });

  it('should invalidate refresh token', async () => {
    const userSession: UserSession = new UserSession({ ...USER_SESSION });
    await authService.invalidateRefreshToken(userSession);
    const now: number = Date.now();
    expect(userSession.refreshTokenExpireDateTime.getTime()).toBeLessThanOrEqual(now);
  });

  it('should save user session after invalidating refresh token', async () => {
    const userSession: UserSession = new UserSession({ ...USER_SESSION });
    await authService.invalidateRefreshToken(userSession);
    expect(userRepository.saveUserSession).toHaveBeenNthCalledWith(1, userSession);
  });

  it('should get user ip address from request ip field', async () => {
    const request: Partial<Request> = { ip: USER_SESSION.ipAddress };
    const ipAddress: string = authService.getUserIpAddress(request as Request);
    expect(ipAddress).toBe(USER_SESSION.ipAddress);
  });

  it('should get user ip address from request header in case services proxy', async () => {
    const request: Partial<Request> = {
      headers: { 'x-forwarded-for': USER_SESSION.ipAddress },
    };
    const ipAddress: string = authService.getUserIpAddress(request as Request);
    expect(ipAddress).toBe(USER_SESSION.ipAddress);
  });

  it('should return undefined instead ip address in case request does not have ip data', async () => {
    const request: Partial<Request> = {};
    const ipAddress: string = authService.getUserIpAddress(request as Request);
    expect(ipAddress).toBeUndefined();
  });
});
