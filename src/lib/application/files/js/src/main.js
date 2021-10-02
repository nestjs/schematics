import { NestFactory } from '@nestjs/core';<% if (useFastify) { %>
import { FastifyAdapter } from '@nestjs/platform-fastify';<% } %>
import { AppModule } from './app.module';

async function bootstrap() {
  <% if (useExpress) { %>const app = await NestFactory.create(AppModule);<% } else if (useFastify) { %>const app = await NestFactory.create(AppModule, new FastifyAdapter());<% } %>
  await app.listen(3000);
}
bootstrap();
