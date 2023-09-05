import { CanActivate, INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { environment } from '../../../../../src/environment';
import {
  AuthModule,
  BaseEventDto,
  JwtAuthGuard,
  ProxyModule,
  QueueType,
  RepositoryType,
  sleep,
  User,
  UserSessionCreationDto,
  UserSessionDto,
} from '../../../../../src/modules';

const BASE_DTO: BaseEventDto = new BaseEventDto({
  id: 'b33bad7c-837d-4a5b-9f56-20d46f5c571d',
  name: 'Test name',
  body: 'Test body',
  timestamp: new Date(),
});
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

describe('ProxyHttpController (e2e)', () => {
  let notSecuredApp: INestApplication;
  let securedApp: INestApplication;

  beforeAll(() => {
    environment.auth.accessTokenExpiresInSec = 4;
    environment.queue.type = QueueType.InMemory;
    environment.repositories.user.type = RepositoryType.InMemory;
    environment.services.proxy.testUsersData = JSON.stringify(TEST_USERS_DATA);
  });

  beforeEach(async () => {
    const mockAuthGuard: CanActivate = { canActivate: jest.fn(() => true) };
    let module: TestingModule = await Test.createTestingModule({
      imports: [
        AuthModule,
        ConfigModule.forRoot({
          isGlobal: true,
          load: [() => environment],
        }),
        ProxyModule,
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockAuthGuard)
      .compile();

    notSecuredApp = module.createNestApplication();
    notSecuredApp.useGlobalPipes(new ValidationPipe({ transform: true }));
    await notSecuredApp.init();

    module = await Test.createTestingModule({
      imports: [
        AuthModule,
        ConfigModule.forRoot({
          isGlobal: true,
          load: [() => environment],
        }),
        ProxyModule,
      ],
    }).compile();
    securedApp = module.createNestApplication();
    securedApp.useGlobalPipes(new ValidationPipe({ transform: true }));
    await securedApp.init();
  });

  afterEach(async () => {
    await notSecuredApp.close();
    await securedApp.close();
  });

  it('should return 200 OK from POST /events API for valid data', async () => {
    await request(notSecuredApp.getHttpServer()).post('/events').send(BASE_DTO).expect(200);
  });

  it('should return 400 Bad Request from POST /events API for invalid data', async () => {
    await request(notSecuredApp.getHttpServer())
      .post('/events')
      .send({
        ...BASE_DTO,
        name: '',
      })
      .expect(400);
  });

  it('should return 200 OK from POST /events API within 500ms', async () => {
    const start: [number, number] = process.hrtime();
    await request(notSecuredApp.getHttpServer()).post('/events').send(BASE_DTO).expect(200);
    const end: [number, number] = process.hrtime(start);
    const time = (end[0] * 1e9 + end[1]) / 1e6; // converting hrtime to milliseconds
    expect(time).toBeLessThan(500);
  });

  it('should return 401 Unauthorized from POST /events API in case access token not provided', async () => {
    await request(securedApp.getHttpServer()).post('/events').send(BASE_DTO).expect(401);
  });

  it('should return 401 Unauthorized from POST /events API in case access token not valid', async () => {
    await request(securedApp.getHttpServer())
      .post('/events')
      .set('Authorization', 'Bearer INVALID_ACCESS_TOKEN')
      .send(BASE_DTO)
      .expect(401);
  });

  it('should return 200 OK from POST /events API for valid data and access token', async () => {
    const response: request.Response = await request(securedApp.getHttpServer())
      .post('/user-sessions')
      .send(USER_SESSION_CREATION_DTO)
      .expect(201);
    const dto: UserSessionDto = response.body;
    await request(securedApp.getHttpServer())
      .post('/events')
      .set('Authorization', `Bearer ${dto.accessToken}`)
      .send(BASE_DTO)
      .expect(200);
  });

  it('should return 401 Unauthorized from POST /events API in case access token expired', async () => {
    const response: request.Response = await request(securedApp.getHttpServer())
      .post('/user-sessions')
      .send(USER_SESSION_CREATION_DTO)
      .expect(201);
    const dto: UserSessionDto = response.body;
    await sleep(4000);
    await request(securedApp.getHttpServer())
      .post('/events')
      .set('Authorization', `Bearer ${dto.accessToken}`)
      .send(BASE_DTO)
      .expect(401);
  });
});
