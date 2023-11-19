import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
<% if(platform==="fastify"){ %>
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify'
<% } %>

async function bootstrap() {
  <% if(platform==="fastify"){ %>
   const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
  <% } else { %>  
   const app = await NestFactory.create(AppModule);
  <% } %>
  await app.listen(3000);
}
bootstrap();
