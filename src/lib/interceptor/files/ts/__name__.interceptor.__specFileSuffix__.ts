import { <%= classify(name) %>Interceptor } from './<%= name %>.interceptor<%= isEsm ? '.js' : '' %>';

describe('<%= classify(name) %>Interceptor', () => {
  it('should be defined', () => {
    expect(new <%= classify(name) %>Interceptor()).toBeDefined();
  });
});
