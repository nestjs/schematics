import { Injectable, NestMiddleware, FunctionMiddleware } from '@nestjs/common';

@Injectable()
export class <%= classify(name) %>Middleware implements NestMiddleware {
  resolve(context: string): FunctionMiddleware {
    return (req, res, next) => {
      next();
    };
  }
}
