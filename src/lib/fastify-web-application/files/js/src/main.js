import { NestFactory } from '@nestjs/core';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';

async function bootstrap() {
  const application = await NestFactory.create(AppModule, new FastifyAdapter());
  return application.listenAsync(3000);
}
bootstrap();
