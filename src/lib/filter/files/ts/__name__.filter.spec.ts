import { <%= classify(name) %>Filter } from './<%= name %>.filter';

describe('<%= classify(name) %>Filter', () => {
  it('should be defined', () => {
    expect(new <%= classify(name) %>Filter()).toBeDefined();
  });
});
