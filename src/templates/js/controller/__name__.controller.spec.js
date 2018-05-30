import { Test } from '@nestjs/testing';
import { <%= classify(name) %>Controller } from './<%= name %>.controller';

describe('<%= classify(name) %> Controller', () => {
  let module;
  beforeAll(async () => {
    module = await Test.createTestingModule({
      controllers: [<%= classify(name) %>Controller],
    }).compile();
  });
  it('should be defined', () => {
    const controller = module.get(<%= classify(name) %>Controller);
    expect(controller).not.toBeUndefined();
  });
});
