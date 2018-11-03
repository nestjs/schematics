import { Injectable, MiddlewareFunction, NestMiddleware } from '@nestjs/common';

@Injectable()
export class <%= classify(name) %>Middleware implements NestMiddleware {
  resolve(...args: any[]): MiddlewareFunction {
    return (req, res, next) => next();
  }
}
