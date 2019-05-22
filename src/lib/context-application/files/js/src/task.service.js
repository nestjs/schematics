import { Injectable } from '@nestjs/common';

@Injectable()
export class TaskService {
  run() {
    return 'Hello Application Context Application !';
  }
}
