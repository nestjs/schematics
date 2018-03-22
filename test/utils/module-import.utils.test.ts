import { expect } from 'chai';
import * as ts from 'typescript';

function getTsSource(path: string, content: string): ts.SourceFile {
  return ts.createSourceFile(path, content, ts.ScriptTarget.Latest, true) as ts.SourceFile;
}

class ModuleImportUtils {
  public static insert(source: ts.SourceFile, modulePath: string, symbol: string, relativePath: string) {
    return this.buildLineToInsert(symbol, relativePath);
  }

  private static buildLineToInsert(symbol: string, relativePath: string): string {
    return `import { ${ symbol } } from '${ relativePath }';\n`;
  }
}

describe('Module Import Utils', () => {
  let modulePath = '/src/app.module.ts';
  let moduleContent =
    'import { Module } from \'@nestjs/common\';\n' +
    'import { AppController } from \'./app.controller\';\n' +
    '\n' +
    '@Module({\n' +
    '  imports: [],\n' +
    '  controllers: [AppController],\n' +
    '  components: [],\n' +
    '})\n' +
    'export class ApplicationModule {}\n';
  it.skip('should insert import to the module file content', () => {
    const source = getTsSource(modulePath, moduleContent);
    const output = ModuleImportUtils.insert(source, modulePath, 'FooController', './foo.controller');
    expect(output).to.match(/import { FooController } from '.\/foo.controller';/);
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
