import { Injectable } from '@nestjs/common';

@Injectable()
export class <%= classify(name) %>Middleware {
  use(req, res, next) {
    next();
  }
}
