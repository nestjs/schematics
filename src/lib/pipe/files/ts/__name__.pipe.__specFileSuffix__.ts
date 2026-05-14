import { <%= classify(name) %>Pipe } from './<%= name %>.pipe<%= isEsm ? '.js' : '' %>';

describe('<%= classify(name) %>Pipe', () => {
  it('should be defined', () => {
    expect(new <%= classify(name) %>Pipe()).toBeDefined();
  });
});
