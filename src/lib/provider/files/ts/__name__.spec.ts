import { Test, TestingModule } from '@nestjs/testing';
import { <%= classify(name) %> } from './<%= name %>';

describe('<%= classify(name) %>', () => {
  let provider: <%= classify(name) %>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [<%= classify(name) %>],
    }).compile();

    provider = module.get<<%= classify(name) %>>(<%= classify(name) %>);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
