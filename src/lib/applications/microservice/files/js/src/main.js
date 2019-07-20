import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const application = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.TCP,
  });
  return application.listenAsync();
}
bootstrap();
