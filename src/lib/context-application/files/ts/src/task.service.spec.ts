import { Test, TestingModule } from '@nestjs/testing';
import { TaskService } from './task.service';

describe('AppController', () => {
  let service: TaskService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [TaskService],
    })
    .compile();

    service = app.get<TaskService>(TaskService);
  });

  describe('root', () => {
    it('should return "Hello Application Context Application !"', () => {
      expect(service.run()).toBe('Hello Application Context Application !');
    });
  });
});
