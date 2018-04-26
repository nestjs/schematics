import { HttpException, HttpStatus } from '@nestjs/common';

export class <%= classify(name) %>Exception extends HttpException {
  constructor() {
    super('<%= classify(name) %>', HttpStatus.NOT_FOUND);
  }
}
