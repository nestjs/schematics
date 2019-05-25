import { Test } from '@nestjs/testing';
import { HeroController } from './hero.controller';

describe('HeroController', () => {
  let controller;

  beforeEach(async () => {
    const app = await Test.createTestingModule({
      controllers: [HeroController],
    })
    .compile();

    controller = app.get(HeroController);
  });

  describe('findOne', () => {
    it('should return John', () => {
      expect(controller.findOne({ id: 1 }, null)).toStrictEqual({ id: 1, name: 'John' });
    });
  });
});
