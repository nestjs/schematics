import { Test, TestingModule } from '@nestjs/testing';
import { <%= classify(name) %>Controller } from './<%= name %>.controller';
import { <%= classify(name) %>Service } from './<%= name %>.service';

describe('<%= classify(name) %>Controller', () => {
  let controller: <%= classify(name) %>Controller;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [<%= classify(name) %>Controller],
      providers: [<%= classify(name) %>Service],
    }).compile();

    controller = module.get<<%= classify(name) %>Controller>(<%= classify(name) %>Controller);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
