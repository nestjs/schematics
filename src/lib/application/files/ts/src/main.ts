import { NestFactory } from '@nestjs/core';<% if (platform === 'express') { %>
import { NestExpressApplication } from '@nestjs/platform-express';<% } else if (platform === 'fastify') { %>
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';<% } %>
import { AppModule } from './app.module';

async function bootstrap() {
  <% if (platform === 'express') { %>const app = await NestFactory.create<NestExpressApplication>(AppModule);<% } else if (platform === 'fastify') { %>const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter()
  );<% } %>
  await app.listen(3000);
}
bootstrap();
