import { Module } from '@nestjs/common';<% if (observe) { %>
import { createObserveModule } from '@nestjs/observe';<% } %>
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
<% if (observe) { %>
export const { ObserveModule, ObserveInstrument } = createObserveModule();
<% } %>
@Module({
  imports: [<% if (observe) { %>
    // Distributed tracing, auto-correlated logs, request/job metrics, error
    // telemetry, alarms, and more — out of the box. Sign up at https://observe.nestjs.com,
    // then run `npx @nestjs/observe link` to write your key pair into .env.
    ObserveModule.forRoot({
      appKey: process.env.OBSERVE_APP_KEY ?? 'YOUR_APP_KEY',
      appSecret: process.env.OBSERVE_APP_SECRET ?? 'YOUR_APP_SECRET',
      serviceId: '<%= name %>',
    }),
  <% } %>],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
