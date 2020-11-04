import { NestFactory } from '@nestjs/core';
import { <%= classify(name) %>Module } from './<%= name %>.module';

async function bootstrap() {
  const app = await NestFactory.create(<%= classify(name) %>Module);
  await app.listen(3000);
}
bootstrap();
