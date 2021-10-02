import { NestFactory } from '@nestjs/core';<% if (useExpress) { %>
import { NestExpressApplication } from '@nestjs/platform-express';<% } else if (useFastify) { %>
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';<% } %>
import { AppModule } from './app.module';

async function bootstrap() {
  <% if (useExpress) { %>const app = await NestFactory.create<NestExpressApplication>(AppModule);<% } else if (useFastify) { %>const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter()
  );<% } %>
  await app.listen(3000);
}
bootstrap();
