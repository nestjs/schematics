import { inPlaceSortByKeys } from '../../src/utils/object-sorting';


describe('inPlaceSortByKeys', () => {
  it('should in-place sort the entities by their keys', () => {
    const input = { z: 'z', b: 'b', c: 'c', a: 'a', };
    expect(Object.keys(input)).toEqual(['z', 'b', 'c', 'a']);

    const got = inPlaceSortByKeys(input);

    expect(got).toBe(input); // Same object
    expect(Object.keys(got)).toEqual(['a', 'b', 'c', 'z']);
  })
})