import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  const application = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.REDIS,
    options: {
      url: process.env.REDIS_URL,
    }
  });
  return application.listenAsync();
}
bootstrap();
