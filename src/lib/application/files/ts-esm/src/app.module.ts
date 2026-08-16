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
    // telemetry, alarms, and more — out of the box. Sign up at https://observe.nestjs.com
    ObserveModule.forRoot({
      appKey: 'YOUR_APP_KEY',
      appSecret: 'YOUR_APP_SECRET',
      serviceId: '<%= name %>',
    }),
  <% } %>],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
