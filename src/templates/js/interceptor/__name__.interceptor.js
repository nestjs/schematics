import { Injectable } from '@nestjs/common';
import { map } from 'rxjs/operators';

@Injectable()
export class <%= classify(name) %>Interceptor {
  intercept(context, call$) {
    return call$.pipe(map((data) => ({ data })));
  }
}
