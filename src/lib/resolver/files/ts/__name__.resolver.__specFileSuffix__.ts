import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';
import { <%= classify(name) %>Resolver } from './<%= name %>.resolver';

describe('<%= classify(name) %>Resolver', () => {
  let resolver: <%= classify(name) %>Resolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [<%= classify(name) %>Resolver],
    }).compile();

    resolver = module.get<<%= classify(name) %>Resolver>(<%= classify(name) %>Resolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
