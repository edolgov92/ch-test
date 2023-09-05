import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { environment } from '../../../../../src/environment';
import {
  AuthModule,
  parseObjectDates,
  QueueType,
  RepositoryType,
  sleep,
  User,
  UserSessionCreationDto,
  UserSessionDto,
  UserSessionRefreshDto,
} from '../../../../../src/modules';

const TEST_USERS_DATA: User[] = [
  {
    id: 'usr_5Qv1ARJMWJnD1hTdbNgiQf',
    authId: 'source_user',
    secret: '$2b$10$59D08dqnE0NS7J09QjjdjuJAuIkEhyv35u00oWDFT1d2aqQFHjrRm',
  },
];
const USER_SESSION_CREATION_DTO: UserSessionCreationDto = new UserSessionCreationDto({
  authId: TEST_USERS_DATA[0].authId,
  secret: 'timbRIanorSo',
});

describe('AuthHttpController (e2e)', () => {
  let app: INestApplication;

  beforeAll(() => {
    environment.auth.accessTokenExpiresInSec = 4;
    environment.auth.refreshTokenExpiresInSec = 8;
    environment.queue.type = QueueType.InMemory;
    environment.repositories.user.type = RepositoryType.InMemory;
    environment.services.proxy.testUsersData = JSON.stringify(TEST_USERS_DATA);
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AuthModule,
        ConfigModule.forRoot({
          isGlobal: true,
          load: [() => environment],
        }),
      ],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('should return 201 Created from POST /user-sessions API for valid data', async () => {
    const response: request.Response = await request(app.getHttpServer())
      .post('/user-sessions')
      .send(USER_SESSION_CREATION_DTO)
      .expect(201);
    const dto: UserSessionDto = response.body;
    parseObjectDates(dto);
    const now: number = Date.now();
    expect(dto).toBeDefined();
    expect(typeof dto.accessToken).toBe('string');
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

  it('should return 400 Bad Request from POST /user-sessions API for invalid data', async () => {
    await request(app.getHttpServer())
      .post('/user-sessions')
      .send({
        ...USER_SESSION_CREATION_DTO,
        secret: '',
      } as UserSessionCreationDto)
      .expect(400);
  });

  it('should return 404 Not Found from POST /user-sessions API in case user not found', async () => {
    await request(app.getHttpServer())
      .post('/user-sessions')
      .send({
        ...USER_SESSION_CREATION_DTO,
        authId: 'test',
      } as UserSessionCreationDto)
      .expect(404);
  });

  it('should return 403 Forbidden from POST /user-sessions API in case secret not valid', async () => {
    await request(app.getHttpServer())
      .post('/user-sessions')
      .send({
        ...USER_SESSION_CREATION_DTO,
        secret: 'test',
      } as UserSessionCreationDto)
      .expect(403);
  });

  it('should return 200 OK from POST /user-sessions/refresh API for valid data', async () => {
    let response: request.Response = await request(app.getHttpServer())
      .post('/user-sessions')
      .send(USER_SESSION_CREATION_DTO);
    const firstUserSessionDto: UserSessionDto = response.body;
    parseObjectDates(firstUserSessionDto);
    await sleep(4000);

    response = await request(app.getHttpServer())
      .post('/user-sessions/refresh')
      .send(new UserSessionRefreshDto({ refreshToken: firstUserSessionDto.refreshToken }))
      .expect(200);

    const dto: UserSessionDto = response.body;
    parseObjectDates(dto);
    expect(dto).toBeDefined();
    expect(typeof dto.accessToken).toBe('string');
    expect(dto.accessToken).not.toBe(firstUserSessionDto.accessToken);
    expect(dto.accessTokenExpireDateTime).toBeInstanceOf(Date);
    expect(dto.accessTokenExpireDateTime.getTime()).toBeGreaterThan(
      firstUserSessionDto.accessTokenExpireDateTime.getTime(),
    );
    expect(typeof dto.id).toBe('string');
    expect(dto.id.startsWith('uss_')).toBeTruthy();
    expect(typeof dto.refreshToken).toBe('string');
    expect(dto.refreshToken.length).toBe(256);
    expect(dto.refreshToken).not.toEqual(firstUserSessionDto.refreshToken);
    expect(dto.refreshTokenExpireDateTime).toBeInstanceOf(Date);
    expect(dto.refreshTokenExpireDateTime.getTime()).toBeGreaterThan(dto.accessTokenExpireDateTime.getTime());
    expect(dto.refreshTokenExpireDateTime.getTime()).toBeGreaterThan(
      firstUserSessionDto.accessTokenExpireDateTime.getTime(),
    );
    expect(dto.startDateTime).toBeInstanceOf(Date);
    expect(dto.startDateTime.getTime()).toBeGreaterThan(firstUserSessionDto.startDateTime.getTime());
  }, 10000);

  it('should return 400 Bad Request from POST /user-sessions/refresh API for invalid data', async () => {
    await request(app.getHttpServer())
      .post('/user-sessions')
      .send({
        refreshToken: '',
      } as UserSessionRefreshDto)
      .expect(400);
  });

  it('should return 403 Forbidden from POST /user-sessions/refresh API in refresh token expired', async () => {
    let response: request.Response = await request(app.getHttpServer())
      .post('/user-sessions')
      .send(USER_SESSION_CREATION_DTO);
    const firstUserSessionDto: UserSessionDto = response.body;
    await sleep(8000);

    response = await request(app.getHttpServer())
      .post('/user-sessions/refresh')
      .send(new UserSessionRefreshDto({ refreshToken: firstUserSessionDto.refreshToken }))
      .expect(403);
  }, 15000);
});
