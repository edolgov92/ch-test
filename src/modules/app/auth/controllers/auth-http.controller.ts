import {
  Body,
  Controller,
  ForbiddenException,
  HttpCode,
  HttpStatus,
  Inject,
  NotFoundException,
  Post,
  Req,
} from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { Request } from 'express';
import {
  User,
  UserSession,
  UserSessionCreationDto,
  UserSessionDto,
  UserSessionRefreshDto,
  WithLogger,
} from '../../../common';
import { USER_REPOSITORY_TOKEN, UserRepository } from '../../../infra';
import { AuthService } from '../services';

@Controller('user-sessions')
export class AuthHttpController extends WithLogger {
  constructor(
    private authService: AuthService,
    @Inject(USER_REPOSITORY_TOKEN) private userRepository: UserRepository,
  ) {
    super();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Create user session',
    type: UserSessionCreationDto,
  })
  async createUserSession(
    @Body() dto: UserSessionCreationDto,
    @Req() request: Request,
  ): Promise<UserSessionDto> {
    const user: User | undefined = await this.userRepository.getUserByAuthId(dto.authId);
    if (!user) {
      throw new NotFoundException(`User with provided authId '${dto.authId}' was not found`);
    }
    const secretValid: boolean = await this.authService.checkSecret(dto.secret, user.secret);
    if (!secretValid) {
      throw new ForbiddenException('Provided secret is not valid');
    }
    const ipAddress: string = this.authService.getUserIpAddress(request);
    return this.authService.createUserSession(user, ipAddress);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Refresh user session',
    type: UserSessionCreationDto,
  })
  async refreshUserSession(
    @Body() dto: UserSessionRefreshDto,
    @Req() request: Request,
  ): Promise<UserSessionDto> {
    const userSession: UserSession | undefined = await this.userRepository.getUserSessionByRefreshToken(
      dto.refreshToken,
    );
    if (!userSession) {
      throw new NotFoundException('User session related to refresh token was not found');
    }
    const ipAddress: string | undefined = this.authService.getUserIpAddress(request);
    if (userSession.ipAddress) {
      if (userSession.ipAddress !== ipAddress) {
        throw new ForbiddenException('IP address was changed, need to create new session');
      }
    }
    if (Date.now() >= userSession.refreshTokenExpireDateTime.getTime()) {
      throw new ForbiddenException(`Provided refresh token was expired, need to create new session`);
    }
    let userSessionDto: UserSessionDto;
    await Promise.all([
      this.authService.invalidateRefreshToken(userSession),
      new Promise<void>(async (resolve) => {
        const user: User = (await this.userRepository.getUserById(userSession.userId))!;
        userSessionDto = await this.authService.createUserSession(user, ipAddress);
        resolve();
      }),
    ]);
    return userSessionDto;
  }
}
