import { Injectable } from '@nestjs/common';
import { map } from 'rxjs/operators';

@Injectable()
export class <%= classify(name) %>Interceptor {
  intercept(context, next) {
    return next
      .handle()
      .pipe(map(data => ({ data })));
  }
}
