import { Injectable } from '@nestjs/common';

@Injectable()
export class <%= classify(name) %>Guard {

  constructor(private reflector) {}

  canActivate(context) {
    return true;
  }
}
