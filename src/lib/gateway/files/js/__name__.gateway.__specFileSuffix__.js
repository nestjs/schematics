import { Test } from '@nestjs/testing';
import { <%= classify(name) %>Gateway } from './<%= name %>.gateway';

describe('<%= classify(name) %>Gateway', () => {
  let gateway;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [<%= classify(name) %>Gateway],
    }).compile();

    gateway = module.get(<%= classify(name) %>Gateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
