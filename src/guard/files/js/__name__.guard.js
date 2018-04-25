import { Injectable, CanActivate } from '@nestjs/common';

@Injectable()
export class <%= classify(name) %>Guard implements CanActivate {

  constructor(private readonly reflector) {}

  canActivate(context) {
    return true;
  }
}
