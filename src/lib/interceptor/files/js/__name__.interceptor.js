import { Injectable } from '@nestjs/common';

@Injectable()
export class <%= classify(name) %>Interceptor {
  intercept(context, next) {
    return next.handle();
  }
}
