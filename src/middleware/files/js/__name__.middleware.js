import { Injectable } from '@nestjs/common';

@Injectable()
export class <%= classify(name) %>Middleware {
  resolve(context) {
    return (req, res, next) => {
      next();
    };
  }
}
