import { Injectable } from '@nestjs/common';

@Injectable()
export class <%= classify(name) %>Guard {
  canActivate(context) {
    return true;
  }
}
