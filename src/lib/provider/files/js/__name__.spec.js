import { Test } from '@nestjs/testing';
import { <%= classify(className) %> } from './<%= name %>';

describe('<%= classify(className) %>', () => {
  let provider;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [<%= classify(className) %>],
    }).compile();

    provider = module.get(<%= classify(className) %>);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
