import { Test, TestingModule } from '@nestjs/testing';
import { MathController } from './math.controller';

describe('MathController', () => {
  let controller: MathController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [MathController],
    })
    .compile();

    controller = app.get<MathController>(MathController);
  });

  describe('sum', () => {
    it('should return 3', () => {
      expect(controller.sum([1, 2])).toBe(3);
    });
  });
});
