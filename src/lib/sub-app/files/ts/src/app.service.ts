import { Injectable } from '@nestjs/common';

@Injectable()
export class <%= classify(name) || 'App' %>Service {
  getHello(): string {
    return 'Hello World!';
  }
}
