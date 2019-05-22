import { Test, TestingModule } from '@nestjs/testing';
import { TaskService } from './task.service';

describe('TaskService', () => {
  let service;

  beforeEach(async () => {
    const app = await Test.createTestingModule({
      providers: [TaskService],
    })
    .compile();

    service = app.get(TaskService);
  });

  describe('root', () => {
    it('should return "Hello Application Context Application !"', () => {
      expect(service.run()).toBe('Hello Application Context Application !');
    });
  });
});
