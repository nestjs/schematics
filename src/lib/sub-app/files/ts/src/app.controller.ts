import { Controller, Get } from '@nestjs/common';
import { <%= classify(name) || 'App' %>Service } from './app.service';

@Controller()
export class <%= classify(name) || 'App' %>Controller {
  constructor(private readonly  <%= (classify(name) || 'App').toLowerCase() %>Service: <%= classify(name) || 'App' %>Service) {}

  @Get()
  getHello(): string {
    return this.<%= (classify(name) || 'App').toLowerCase() %>Service.getHello();
  }
}
