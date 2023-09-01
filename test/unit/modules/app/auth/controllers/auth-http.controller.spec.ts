import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';
import * as RandToken from 'rand-token';
import {
  User,
  UserSession,
  UserSessionCreationDto,
  UserSessionDto,
  UserSessionRefreshDto,
} from '../../../../../../src/modules';
import { AuthHttpController } from '../../../../../../src/modules/app/auth/controllers';
import { AuthService } from '../../../../../../src/modules/app/auth/services';
import { USER_REPOSITORY_TOKEN, UserRepository } from '../../../../../../src/modules/infra';

const USER: User = new User({
  authId: 'source_user',
  secret: 'timbRIanorSo',
});
const USER_IP_ADDRESS: string = '66.249.70.192';
const USER_SESSION_CREATION_DTO: UserSessionCreationDto = new UserSessionCreationDto({
  authId: USER.authId,
  secret: USER.secret,
});

const REQUEST: Partial<Request> = {
  ip: USER_IP_ADDRESS,
};

const ACCESS_TOKEN_EXPIRE_DATE_TIME: Date = new Date();
ACCESS_TOKEN_EXPIRE_DATE_TIME.setHours(ACCESS_TOKEN_EXPIRE_DATE_TIME.getHours() + 1);
const REFRESH_TOKEN_EXPIRE_DATE_TIME: Date = new Date(ACCESS_TOKEN_EXPIRE_DATE_TIME);
REFRESH_TOKEN_EXPIRE_DATE_TIME.setHours(REFRESH_TOKEN_EXPIRE_DATE_TIME.getHours() + 1);

const USER_SESSION: UserSession = new UserSession({
  accessToken:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoidXNyXzVRdjFBUkpNV0puRDFoVGRiTmdpUWYiLCJhdXRoSWQiOiJzb3VyY2VfdXNlciJ9LCJpYXQiOjE2OTM1NzY2OTgsImV4cCI6MTY5MzU3NjcyOH0.8pLUCLtLi_bcFQTX7LhxGWw67EzkeBzODzWCXjpzcoU',
  accessTokenExpireDateTime: ACCESS_TOKEN_EXPIRE_DATE_TIME,
  ipAddress: USER_IP_ADDRESS,
  refreshToken: RandToken.uid(256),
  refreshTokenExpireDateTime: REFRESH_TOKEN_EXPIRE_DATE_TIME,
  startDateTime: new Date(),
  userId: USER.id,
});
const USER_SESSION_REFRESH_DTO: UserSessionRefreshDto = new UserSessionRefreshDto({
  refreshToken: USER_SESSION.refreshToken,
});

describe('AuthHttpController', () => {
  let authHttpController: AuthHttpController;
  let authService: Partial<AuthService>;
  let userRepository: Partial<UserRepository>;

  beforeEach(async () => {
    authService = {
      checkSecret: jest
        .fn()
        .mockImplementation((dtoSecret: string, storedSecret: string) => dtoSecret === storedSecret),
      createUserSession: jest.fn().mockResolvedValue(USER_SESSION),
      getUserIpAddress: jest.fn().mockReturnValue(USER_IP_ADDRESS),
      invalidateRefreshToken: jest.fn(),
    };
    userRepository = {
      getUserByAuthId: jest
        .fn()
        .mockImplementation((authId: string) => (authId === USER.authId ? USER : undefined)),
      getUserById: jest.fn().mockImplementation((id: string) => (id === USER.id ? USER : undefined)),
      getUserSessionByRefreshToken: jest
        .fn()
        .mockImplementation((refreshToken: string) =>
          refreshToken === USER_SESSION.refreshToken ? USER_SESSION : undefined,
        ),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthHttpController],
      providers: [
        {
          provide: AuthService,
          useValue: authService,
        },
        {
          provide: USER_REPOSITORY_TOKEN,
          useValue: userRepository,
        },
      ],
    }).compile();

    authHttpController = module.get<AuthHttpController>(AuthHttpController);
  });

  it('should create user session in case valid credentials', async () => {
    const dto: UserSessionDto = await authHttpController.createUserSession(
      USER_SESSION_CREATION_DTO,
      REQUEST as Request,
    );
    expect(dto).toBe(USER_SESSION);
  });

  it('should throw error in case user not exists in repository', async () => {
    const dto: UserSessionCreationDto = new UserSessionCreationDto({
      ...USER_SESSION_CREATION_DTO,
      authId: '123456789',
    });
    await expect(authHttpController.createUserSession(dto, REQUEST as Request)).rejects.toThrowError(
      NotFoundException,
    );
  });

  it('should throw error in case secret is not valid', async () => {
    const dto: UserSessionCreationDto = new UserSessionCreationDto({
      ...USER_SESSION_CREATION_DTO,
      secret: '123456789',
    });
    await expect(authHttpController.createUserSession(dto, REQUEST as Request)).rejects.toThrowError(
      ForbiddenException,
    );
  });

  it('should refresh user session in case valid refreshToken', async () => {
    const dto: UserSessionDto = await authHttpController.refreshUserSession(
      USER_SESSION_REFRESH_DTO,
      REQUEST as Request,
    );
    expect(dto).toBe(USER_SESSION);
  });

  it('should throw error in case user session related to refreshToken not exists in repository', async () => {
    const dto: UserSessionRefreshDto = new UserSessionRefreshDto({
      refreshToken: '123456789',
    });
    await expect(authHttpController.refreshUserSession(dto, REQUEST as Request)).rejects.toThrowError(
      NotFoundException,
    );
  });

  it('should throw error in case ip address do not match refresh token', async () => {
    authService.getUserIpAddress = jest.fn().mockReturnValue('67.126.70.124');
    await expect(
      authHttpController.refreshUserSession(USER_SESSION_REFRESH_DTO, REQUEST as Request),
    ).rejects.toThrowError(ForbiddenException);
  });

  it('should throw error in case refresh token expired', async () => {
    userRepository.getUserSessionByRefreshToken = jest
      .fn()
      .mockResolvedValue(new UserSession({ ...USER_SESSION, refreshTokenExpireDateTime: new Date() }));
    await expect(
      authHttpController.refreshUserSession(USER_SESSION_REFRESH_DTO, REQUEST as Request),
    ).rejects.toThrowError(ForbiddenException);
  });

  it('should invalidate old refresh token after refreshing session', async () => {
    await authHttpController.refreshUserSession(USER_SESSION_REFRESH_DTO, REQUEST as Request);
    expect(authService.invalidateRefreshToken).toHaveBeenNthCalledWith(1, USER_SESSION);
  });

  it('should create new session in repository while refreshing session process', async () => {
    await authHttpController.refreshUserSession(USER_SESSION_REFRESH_DTO, REQUEST as Request);
    expect(authService.createUserSession).toHaveBeenNthCalledWith(1, USER, USER_IP_ADDRESS);
  });
});
