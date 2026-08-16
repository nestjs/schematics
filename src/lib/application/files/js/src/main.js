import { NestFactory } from '@nestjs/core';
import { AppModule<% if (observe) { %>, ObserveInstrument<% } %> } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule<% if (observe) { %>, {
    instrument: ObserveInstrument,
  }<% } %>);
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
