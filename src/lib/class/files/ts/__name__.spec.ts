import { <%= classify(name) %> } from './<%= name %>';

describe('<%= classify(name) %>', () => {
  it('should be defined', () => {
    expect(new <%= classify(name) %>()).toBeDefined();
  });
});
