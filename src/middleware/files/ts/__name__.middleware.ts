import { Injectable, NestMiddleware, MiddlewareFunction } from '@nestjs/common';

@Injectable()
export class <%= classify(name) %>Middleware implements NestMiddleware {
  resolve(context: string): MiddlewareFunction {
    return (req, res, next) => {
      next();
    };
  }
}
