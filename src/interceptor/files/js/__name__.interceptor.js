import { Injectable } from '@nestjs/common';
import { map } from 'rxjs/operators';

@Injectable()
export class <%= classify(name) %>Interceptor {
  intercept(context, stream$) {
    return stream$.pipe(map((data) => data));
  }
}
