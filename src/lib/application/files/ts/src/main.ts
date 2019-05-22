import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
<% if(cluster) { %>
import {isMaster, fork} from 'cluster';
<% } %>

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
<% if(!cluster) { %>
bootstrap();
<% } else { %>
if (isMaster) {
  for (let i = 0; i < <%= cluster %>; i++) {
    fork();
  }
} else {
  bootstrap();
}
<% } %>
