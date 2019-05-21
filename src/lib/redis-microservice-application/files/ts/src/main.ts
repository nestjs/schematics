import { INestMicroservice } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const application: INestMicroservice = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.REDIS,
    options: {
      url: process.env.REDIS_URL,
    },
  });
  return application.listenAsync();
}
bootstrap();
