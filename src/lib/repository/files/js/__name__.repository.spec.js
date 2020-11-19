import { <%= classify(name) %>Repository } from './<%= name %>.repository';

describe('<%= classify(name) %>Repository', () => {
  it('should be defined', () => {
    expect(new <%= classify(name) %>Repository()).toBeDefined();
  });
});
