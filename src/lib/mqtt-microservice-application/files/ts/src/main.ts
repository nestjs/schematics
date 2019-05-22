import { INestMicroservice } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  const application: INestMicroservice = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.MQTT,
    options: {
      host: process.env.MQTT_HOST || 'localhost',
      port: parseInt(process.env.MQTT_PORT || '1883', 10),
    },
  });
  await application.listenAsync();
}
bootstrap();
