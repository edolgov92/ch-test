import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import 'dotenv/config';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { environment } from './environment';
import { getEnvironmentMicroserviceConfig } from './modules/common';

async function bootstrap() {
  const app: INestApplication = await NestFactory.create(AppModule);
  app.connectMicroservice(getEnvironmentMicroserviceConfig());

  app.enableCors();
  app.setGlobalPrefix('/api');
  app.use(helmet());
  app.use(rateLimit(environment.rateLimit));
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

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
