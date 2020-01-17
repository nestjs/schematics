import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);

  const url = await app.getUrl();
  // tslint:disable-next-line: no-console
  console.log(`** NestJS Server is listening on ${url}`);
}
bootstrap();
