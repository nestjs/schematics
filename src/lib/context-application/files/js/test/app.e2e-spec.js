import { Test } from '@nestjs/testing';
import { AppModule } from './../src/app.module';
import { TaskService } from '../src/task.service';

describe('TaskService (e2e)', () => {
  let service;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    })
    .compile();
    service = module.get(TaskService);
  });

  it('should return "Hello Application Context Application !"', () => {
    expect(service.run()).toBe('Hello Application Context Application !');
  });
});
