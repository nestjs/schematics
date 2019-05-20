import { NestFactory } from '@nestjs/core';
import { NestFastifyApplication, FastifyAdapter } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';

async function bootstrap() {
  const application = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
  return application.listenAsync(3000);
}
bootstrap();
