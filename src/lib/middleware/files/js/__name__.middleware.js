import { Injectable } from '@nestjs/common';

@Injectable()
export class <%= classify(name) %>Middleware {
  resolve(...args) {
    return (req, res, next) => next();
  }
}
