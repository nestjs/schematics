import { Injectable } from '@nestjs/common';

@Injectable()
export class <%= classify(name) %>Pipe {
  transform(value, metadata) {
    return value;
  }
}
