import { Injectable } from '@nestjs/common';

@Injectable()
export class TaskService {
  public run(): string {
    return 'Hello Application Context Application !';
  }
}
