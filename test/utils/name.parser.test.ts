import { expect } from 'chai';
import { Location, NameParser, ParseOptions } from '../../src/utils/name.parser';

describe('Name Parser', () => {
  let parser: NameParser;
  before(() => parser = new NameParser());
  it('should handle no path', () => {
    const options: ParseOptions = {
      name: 'foo'
    };
    const location: Location = parser.parse(options);
    expect(location.name).to.be.equal('foo');
    expect(location.path).to.be.equal('/');
  });
  it('should handle just the name', () => {
    const options: ParseOptions = {
      name: 'foo',
      path: 'baz'
    };
    const location: Location = parser.parse(options);
    expect(location.name).to.be.equal('foo');
    expect(location.path).to.be.equal('/baz');
  });
  it('should handle name has a path (sub-dir)', () => {
    const options: ParseOptions = {
      name: 'bar/foo',
      path: 'baz'
    };
    const location: Location = parser.parse(options);
    expect(location.name).to.be.equal('foo');
    expect(location.path).to.be.equal('/baz/bar');
  });

  it('should handle name has a higher path', () => {
    const options: ParseOptions = {
      name: '../foo',
      path: 'bar/baz'
    };
    const location: Location = parser.parse(options);
    expect(location.name).to.be.equal('foo');
    expect(location.path).to.be.equal('/bar');
  });

  it('should handle name has a higher path above root', () => {
    const options: ParseOptions = {
      name: '../../../foo',
      path: 'baz'
    };
    expect(() => parser.parse(options)).to.throw();
  });
});
