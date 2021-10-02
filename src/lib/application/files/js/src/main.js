import { NestFactory } from '@nestjs/core';<% if (platform === 'fastify') { %>
import { FastifyAdapter } from '@nestjs/platform-fastify';<% } %>
import { AppModule } from './app.module';

async function bootstrap() {
  <% if (platform === 'express') { %>const app = await NestFactory.create(AppModule);<% } else if (platform === 'fastify') { %>const app = await NestFactory.create(AppModule, new FastifyAdapter());<% } %>
  await app.listen(3000);
}
bootstrap();
