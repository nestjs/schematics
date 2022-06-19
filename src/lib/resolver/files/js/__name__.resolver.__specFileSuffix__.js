import { Test } from '@nestjs/testing';
import { <%= classify(name) %>Resolver } from './<%= name %>.resolver';

describe('<%= classify(name) %>Resolver', () => {
  let resolver;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [<%= classify(name) %>Resolver],
    }).compile();

    resolver = module.get(<%= classify(name) %>Resolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
