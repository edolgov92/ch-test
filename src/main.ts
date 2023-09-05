import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import 'dotenv/config';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { ApiConfig, Environment, RateLimitConfig } from './environment';
import { getMicroserviceStrategyEnvironmentConfig } from './modules/infra';

async function bootstrap() {
  const app: INestApplication = await NestFactory.create(AppModule);
  const configService: ConfigService<Environment> = app.get(ConfigService);
  app.connectMicroservice(getMicroserviceStrategyEnvironmentConfig(configService));

  app.enableCors();
  app.setGlobalPrefix('/api');
  app.use(helmet());
  const rateLimitConfig: RateLimitConfig = configService.get('rateLimit');
  app.use(rateLimit({ windowMs: rateLimitConfig.intervalMs, max: rateLimitConfig.requestsPerInterval }));
  app.useGlobalPipes(
    new ValidationPipe({ transform: true, transformOptions: { excludeExtraneousValues: true } }),
  );

  const apiConfig: ApiConfig = configService.get('api');
  const options = new DocumentBuilder()
    .setTitle(apiConfig.name)
    .setDescription(apiConfig.description)
    .setVersion(apiConfig.version)
    .addBearerAuth()
    .build();
  const document: OpenAPIObject = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api-docs', app, document);

  await app.startAllMicroservices();
  await app.listen(configService.get('port'));
}
bootstrap();
