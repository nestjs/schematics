import { Test } from '@nestjs/testing';
import { MathController } from './math.controller';

describe('MathController', () => {
  let controller;

  beforeEach(async () => {
    const app = await Test.createTestingModule({
      controllers: [MathController],
    })
    .compile();

    controller = app.get(MathController);
  });

  describe('sum', () => {
    it('should return 3', () => {
      expect(controller.sum([1, 2])).toBe(3);
    });
  });
});
