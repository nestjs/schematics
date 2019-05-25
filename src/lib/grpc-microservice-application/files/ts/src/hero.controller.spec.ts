import { Test, TestingModule } from '@nestjs/testing';
import { HeroController } from './hero.controller';

describe('HeroController', () => {
  let controller: HeroController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [HeroController],
    })
    .compile();

    controller = app.get<HeroController>(HeroController);
  });

  describe('findOne', () => {
    it('should return John', () => {
      expect(controller.findOne({ id: 1 }, null)).toStrictEqual({ id: 1, name: 'John' });
    });
  });
});
