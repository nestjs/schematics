import { Injectable } from '@nestjs/common';

@Injectable()
export class <%= classify(name)%>Service {
  getHello(): string {
    return 'Hello World!';
  }
}
