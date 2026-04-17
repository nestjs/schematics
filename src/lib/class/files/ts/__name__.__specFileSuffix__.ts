import { describe, expect, it } from '@jest/globals';
import { <%= classify(className) %> } from './<%= name %>';

describe('<%= classify(className) %>', () => {
  it('should be defined', () => {
    expect(new <%= classify(className) %>()).toBeDefined();
  });
});
