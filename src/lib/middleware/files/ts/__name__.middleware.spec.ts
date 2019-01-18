import { <%= classify(name) %>Middleware } from './<%= name %>.middleware';

describe('<%= classify(name) %>Middleware', () => {
  it('should be defined', () => {
    expect(new <%= classify(name) %>Middleware()).toBeDefined();
  });
});
