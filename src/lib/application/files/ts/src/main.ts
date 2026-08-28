import { NestFactory } from '@nestjs/core';
import { AppModule<% if (observe) { %>, ObserveInstrument<% } %> } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule<% if (observe) { %>, {
    instrument: ObserveInstrument,
  }<% } %>);
  const port = process.env.PORT ?? 3000;

  if (process.env.HOST) {
    await app.listen(port, process.env.HOST);
  } else {
    await app.listen(port);
  }
}
bootstrap();
