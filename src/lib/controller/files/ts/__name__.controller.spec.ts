import { Test, TestingModule } from '@nestjs/testing';
import { <%= classify(name) %>Controller } from './<%= name %>.controller';

describe('<%= classify(name) %> Controller', () => {
  let module: TestingModule;
  
  beforeAll(async () => {
    module = await Test.createTestingModule({
      controllers: [<%= classify(name) %>Controller],
    }).compile();
  });
  it('should be defined', () => {
    const controller: <%= classify(name) %>Controller = module.get<<%= classify(name) %>Controller>(<%= classify(name) %>Controller);
    expect(controller).toBeDefined();
  });
});
