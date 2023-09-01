import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import 'dotenv/config';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { environment } from './environment';
import { getMicroserviceStrategyEnvironmentConfig } from './modules/infra';

async function bootstrap() {
  const app: INestApplication = await NestFactory.create(AppModule);
  app.connectMicroservice(getMicroserviceStrategyEnvironmentConfig());

  app.enableCors();
  app.setGlobalPrefix('/api');
  app.use(helmet());
  app.use(
    rateLimit({ windowMs: environment.rateLimit.intervalMs, max: environment.rateLimit.requestsPerInterval }),
  );
  app.useGlobalPipes(
    new ValidationPipe({ transform: true, transformOptions: { excludeExtraneousValues: true } }),
  );

  const options = new DocumentBuilder()
    .setTitle(environment.api.name)
    .setDescription(environment.api.description)
    .setVersion(environment.api.version)
    .addBearerAuth()
    .build();
  const document: OpenAPIObject = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api-docs', app, document);

  await app.startAllMicroservices();
  await app.listen(environment.port);
}
bootstrap();
