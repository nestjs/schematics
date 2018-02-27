import { VirtualTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { expect } from 'chai';
import * as path from 'path';
import { ApplicationOptions } from '../../src/application/schema';

describe('Application Factory', () => {
  const options: ApplicationOptions = {
    extension: 'ts',
    path: 'path'
  };
  let runner: SchematicTestRunner;
  beforeEach(() => {
    runner = new SchematicTestRunner(
      '.',
      path.join(process.cwd(), 'src/collection.json')
    );
  });
  it('should generate Nest application files', () => {
    const tree: UnitTestTree = runner.runSchematic('application', options, new VirtualTree());
    const files: string[] = tree.files;
    expect(files.find((filename) => filename === `/${ options.path }/package.json`))
      .to.not.be.undefined;
    expect(files.find((filename) => filename === `/${ options.path }/nestconfig.json`))
      .to.not.be.undefined;
    expect(files.find((filename) => filename === `/${ options.path }/src/main.ts`))
      .to.not.be.undefined;
    expect(files.find((filename) => filename === `/${ options.path }/src/application.module.ts`))
      .to.not.be.undefined;
  });
  it(`should generate the right '${ options.path }/package.json' file content`, () => {
    const tree: UnitTestTree = runner.runSchematic('application', options, new VirtualTree());
    expect(tree.read(`/${ options.path }/package.json`).toString())
      .to.be.equal(
        JSON.stringify(
          {
            name: "nest-typescript-starter",
            version: "1.0.0",
            description: "",
            main: "index.js",
            scripts: {
              test: "echo \"Error: no test specified\" && exit 1"
            },
            author: "",
            license: "ISC",
            dependencies: {
              "@nestjs/common": "^4.5.9",
              "@nestjs/core": "^4.5.10",
              "@nestjs/testing": "^4.5.5",
              "reflect-metadata": "^0.1.12",
              "rxjs": "^5.5.6"
            }
          },
          null,
          2)
      );
  });
  it(`should generate the right '${ options.path }/nestconfig.json' file content`, () => {
    const tree: UnitTestTree = runner.runSchematic('application', options, new VirtualTree());
    expect(tree.read(`/${ options.path }/nestconfig.json`).toString())
      .to.be.equal(
      JSON.stringify(
        {
          language: 'ts'
        },
        null,
        2)
    );
  });
  it(`should generate the right '${ options.path }/src/main.ts' file content`, () => {
    const tree: UnitTestTree = runner.runSchematic('application', options, new VirtualTree());
    expect(tree.read(`/${ options.path }/src/main.ts`).toString())
      .to.be.equal(
        'import { NestFactory } from \'@nestjs/core\';\n' +
        'import { ApplicationModule } from \'./application.module\';\n' +
        '\n' +
        'async function bootstrap() {\n' +
        '\tconst app = await NestFactory.create(ApplicationModule);\n' +
        '\tawait app.listen(3000);\n' +
        '}\n' +
        'bootstrap();\n'
      );
  });
  it(`should generate the right '${ options.path }/src/application.module.ts' file content`, () => {
    const tree: UnitTestTree = runner.runSchematic('application', options, new VirtualTree());
    expect(tree.read(`/${ options.path }/src/application.module.ts`).toString())
      .to.be.equal(
        'import { Module } from \'@nestjs/common\';\n' +
        '\n' +
        '@Module({})\n' +
        'export class ApplicationModule {}\n'
      );
  });
});
