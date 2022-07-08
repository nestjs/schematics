import { <%= classify(name) %>Guard } from './<%= name %>.guard';

describe('<%= classify(name) %>Guard', () => {
  it('should be defined', () => {
    expect(new <%= classify(name) %>Guard()).toBeDefined();
  });
});
