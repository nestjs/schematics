import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  constructor(service) {
    this.service = service;
  }

  @Get()
  getHello() {
    return this.service.getHello();
  }
}
