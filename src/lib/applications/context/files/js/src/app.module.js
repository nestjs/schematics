import { Module } from '@nestjs/common';
import { TaskService } from './task.service';

@Module({
  providers: [
    TaskService,
  ],
})
export class AppModule {}
