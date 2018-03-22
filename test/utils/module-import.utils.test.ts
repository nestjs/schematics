import { expect } from 'chai';
import { ModuleImportUtils } from '../../src/utils/module-import.utils';

describe('Module Import Utils', () => {
  let source =
    'import { Module } from \'@nestjs/common\';\n' +
    'import { AppController } from \'./app.controller\';\n' +
    '\n' +
    '@Module({\n' +
    '  imports: [],\n' +
    '  controllers: [AppController],\n' +
    '  components: [],\n' +
    '})\n' +
    'export class ApplicationModule {}\n';
  it('should insert import to the module file content', () => {
    const output = ModuleImportUtils.insert(source, 'FooController', './foo.controller');
    expect(output).to.be.equal(
      'import { Module } from \'@nestjs/common\';\n' +
      'import { AppController } from \'./app.controller\';\n' +
      'import { FooController } from \'./foo.controller\';\n' +
      '\n' +
      '@Module({\n' +
      '  imports: [],\n' +
      '  controllers: [AppController],\n' +
      '  components: [],\n' +
      '})\n' +
      'export class ApplicationModule {}\n'
    );
  });
});
