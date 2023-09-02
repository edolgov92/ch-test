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
} from '../../../../../src/modules';

const BASE_DTO: BaseEventDto = new BaseEventDto({
  id: 'b33bad7c-837d-4a5b-9f56-20d46f5c571d',
  name: 'Test name',
  body: 'Test body',
  timestamp: new Date(),
});

describe('ProxyHttpController (e2e)', () => {
  let app: INestApplication;

  beforeAll(() => {
    environment.repositories.user.type = RepositoryType.InMemory;
    environment.queue.type = QueueType.InMemory;
  });

  beforeEach(async () => {
    const mockAuthGuard: CanActivate = { canActivate: jest.fn(() => true) };
    const module: TestingModule = await Test.createTestingModule({
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

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('should return 200 OK from POST /events API for valid data', async () => {
    await request(app.getHttpServer()).post('/events').send(BASE_DTO).expect(200);
  });

  it('should return 400 Bad Request from POST /events API for invalid data', async () => {
    await request(app.getHttpServer())
      .post('/events')
      .send({
        ...BASE_DTO,
        name: '',
      })
      .expect(400);
  });

  it('should return 200 OK from POST /events API within 500ms', async () => {
    const start: [number, number] = process.hrtime();
    await request(app.getHttpServer()).post('/events').send(BASE_DTO).expect(200);
    const end: [number, number] = process.hrtime(start);
    const time = (end[0] * 1e9 + end[1]) / 1e6; // converting hrtime to milliseconds
    expect(time).toBeLessThan(500);
  });
});
