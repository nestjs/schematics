import { NestFactory } from '@nestjs/core';
import { <%= classify(name) || 'App' %>Module } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(<%= classify(name) || 'App' %>Module);
  await app.listen(3000);
}
bootstrap();
