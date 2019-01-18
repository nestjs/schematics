import { Test } from '@nestjs/testing';
import { <%= classify(name) %> } from './<%= name %>';

describe('<%= classify(name) %>', () => {
  let provider;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [<%= classify(name) %>],
    }).compile();

    provider = module.get(<%= classify(name) %>);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
