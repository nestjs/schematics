import { Controller, Get, Injectable, Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';<% if (observe) { %>
import { createObserveModule } from '@nestjs/observe';

const { ObserveModule, ObserveInstrument } = createObserveModule();<% } %>

@Injectable()
class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}

@Controller()
class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}

@Module({<% if (observe) { %>
  imports: [
    // Distributed tracing, auto-correlated logs, request/job metrics, error
    // telemetry, alarms, and more — out of the box. Sign up at https://observe.nestjs.com,
    // then run `npx @nestjs/observe link` to write your key pair into .env.
    ObserveModule.forRoot({
      appKey: process.env.OBSERVE_APP_KEY ?? 'YOUR_APP_KEY',
      appSecret: process.env.OBSERVE_APP_SECRET ?? 'YOUR_APP_SECRET',
      serviceId: '<%= name %>',
    }),
  ],<% } %>
  controllers: [AppController],
  providers: [AppService],
})
class AppModule {}

async function bootstrap() {
  const app = await NestFactory.create(AppModule<% if (observe) { %>, {
    instrument: ObserveInstrument,
  }<% } %>);
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
