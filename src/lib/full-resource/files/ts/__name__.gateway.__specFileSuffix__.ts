import { Test, TestingModule } from '@nestjs/testing';
import { <%= classify(name) %>Gateway } from './<%= name %>.gateway';
import { <%= classify(name) %>Service } from './<%= name %>.service';

describe('<%= classify(name) %>Gateway', () => {
  let gateway: <%= classify(name) %>Gateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [<%= classify(name) %>Gateway, <%= classify(name) %>Service],
    }).compile();

    gateway = module.get<<%= classify(name) %>Gateway>(<%= classify(name) %>Gateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
