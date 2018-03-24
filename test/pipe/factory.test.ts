import { VirtualTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { expect } from 'chai';
import * as path from 'path';
import { PipeOptions } from '../../src/pipe/schema';

describe('Pipe Factory', () => {
  const options: PipeOptions = {
    name: 'name',
  };
  let tree: UnitTestTree;
  beforeEach(() => {
    const runner: SchematicTestRunner = new SchematicTestRunner(
      '.',
      path.join(process.cwd(), 'src/collection.json')
    );
    tree = runner.runSchematic('pipe', options, new VirtualTree());
  });
  it('should generate a new pipe file', () => {
    const files: string[] = tree.files;
    expect(
      files.find((filename) =>
        filename === `/src/${ options.name }.pipe.ts`
      )
    ).to.not.be.undefined;
  });
  it('should generate the expect pipe file content', () => {
    expect(
      tree.readContent(`/src/${ options.name }.pipe.ts`)
    ).to.be.equal(
      'import { PipeTransform, Pipe, ArgumentMetadata } from \'@nestjs/common\';\n' +
      '\n' +
      '@Pipe()\n' +
      'export class NamePipe implements PipeTransform<any> {\n' +
      '  transform(value: any, metadata: ArgumentMetadata) {\n' +
      '    return value;\n' +
      '  }\n' +
      '}\n'
    );
  });
});
