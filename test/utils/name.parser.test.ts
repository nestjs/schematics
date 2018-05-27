import { Location, NameParser, ParseOptions } from '../../src/utils/name.parser';

describe('Name Parser', () => {
  let parser: NameParser;
  beforeAll(() => parser = new NameParser());
  it('should handle no path', () => {
    const options: ParseOptions = {
      name: 'foo'
    };
    const location: Location = parser.parse(options);
    expect(location.name).toEqual('foo');
    expect(location.path).toEqual('/');
  });
  it('should handle just the name', () => {
    const options: ParseOptions = {
      name: 'foo',
      path: 'baz'
    };
    const location: Location = parser.parse(options);
    expect(location.name).toEqual('foo');
    expect(location.path).toEqual('/baz');
  });
  it('should handle name has a path (sub-dir)', () => {
    const options: ParseOptions = {
      name: 'bar/foo',
      path: 'baz'
    };
    const location: Location = parser.parse(options);
    expect(location.name).toEqual('foo');
    expect(location.path).toEqual('/baz/bar');
  });

  it('should handle name has a higher path', () => {
    const options: ParseOptions = {
      name: '../foo',
      path: 'bar/baz'
    };
    const location: Location = parser.parse(options);
    expect(location.name).toEqual('foo');
    expect(location.path).toEqual('/bar');
  });

  it('should handle name has a higher path above root', () => {
    const options: ParseOptions = {
      name: '../../../foo',
      path: 'baz'
    };
    expect(() => parser.parse(options)).toThrow();
  });
});
