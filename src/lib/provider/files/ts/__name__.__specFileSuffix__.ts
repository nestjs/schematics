import { Test, TestingModule } from '@nestjs/testing';
import { <%= classify(className) %> } from './<%= name %><%= isEsm ? '.js' : '' %>';

describe('<%= classify(className) %>', () => {
  let provider: <%= classify(className) %>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [<%= classify(className) %>],
    }).compile();

    provider = module.get<<%= classify(className) %>>(<%= classify(className) %>);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
