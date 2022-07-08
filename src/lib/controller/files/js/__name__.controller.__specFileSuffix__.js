import { Test } from '@nestjs/testing';
import { <%= classify(name) %>Controller } from './<%= name %>.controller';

describe('<%= classify(name) %> Controller', () => {
  let controller;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [<%= classify(name) %>Controller],
    }).compile();

    controller = module.get(<%= classify(name) %>Controller);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
