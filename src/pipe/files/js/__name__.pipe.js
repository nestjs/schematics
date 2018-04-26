import { Pipe } from '@nestjs/common';

@Pipe()
export class <%= classify(name) %>Pipe {
  async transform(value, metadata) {
    return value;
  }
}
