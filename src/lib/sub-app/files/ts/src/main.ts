import { NestFactory } from '@nestjs/core';
import { <%= classify(name) %>Module } from './<%= name %>.module<%= isEsm ? '.js' : '' %>';

async function bootstrap() {
  const app = await NestFactory.create(<%= classify(name) %>Module);
  await app.listen(process.env.port ?? 3000);
}
<%= isEsm ? 'await ' : '' %>bootstrap();
