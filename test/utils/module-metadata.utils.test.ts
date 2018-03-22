import { expect } from 'chai';
import { ModuleMetadataUtils } from '../../src/utils/module-metadata.utils';

describe('Module Metadata Utils', () => {
  const source =
    'import { Module } from \'@nestjs/common\';\n' +
    'import { AppController } from \'./app.controller\';\n' +
    '\n' +
    '@Module({\n' +
    '  imports: [],\n' +
    '  controllers: [AppController],\n' +
    '  components: [],\n' +
    '})\n' +
    'export class ApplicationModule {}\n';
  it('should add a module to modules metadata', () => {
    const output: string = ModuleMetadataUtils.insert(source, 'FooModule');
    expect(output).to.match(/imports: \[ FooModule \]/);
  });
});
