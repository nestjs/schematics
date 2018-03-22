import { VirtualTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { expect } from 'chai';
import * as path from 'path';
import { ApplicationOptions } from '../../src/application/schema';

describe('Application Factory', () => {
  const options: ApplicationOptions = {
    directory: 'directory'
  };
  let tree: UnitTestTree;
  beforeEach(() => {
    const runner: SchematicTestRunner = new SchematicTestRunner(
      '.',
      path.join(process.cwd(), 'src/collection.json')
    );
    tree = runner.runSchematic('application', options, new VirtualTree());
  });
  it('should generate Nest application starter project structure',
    () => {
      const files: string[] = tree.files;
      expect(files.find((filename) => filename === `/${ options.directory }/src/main.ts`))
        .to.not.be.undefined;
      expect(files.find((filename) => filename === `/${ options.directory }/src/app.module.ts`))
        .to.not.be.undefined;
      expect(files.find((filename) => filename === `/${ options.directory }/src/app.controller.ts`))
        .to.not.be.undefined;
      expect(files.find((filename) => filename === `/${ options.directory }/index.js`))
        .to.not.be.undefined;
      expect(files.find((filename) => filename === `/${ options.directory }/nodemon.json`))
        .to.not.be.undefined;
      expect(files.find((filename) => filename === `/${ options.directory }/package.json`))
        .to.not.be.undefined;
      expect(files.find((filename) => filename === `/${ options.directory }/tsconfig.json`))
        .to.not.be.undefined;
      expect(files.find((filename) => filename === `/${ options.directory }/tslint.json`))
        .to.not.be.undefined;
    });
  it(`should generate the right '${ options.directory }/src/main.ts' file content`,
    () => {
      expect(tree.readContent(`/${ options.directory }/src/main.ts`))
        .to.be.equal(
        'import { NestFactory } from \'@nestjs/core\';\n' +
        'import { ApplicationModule } from \'./app.module\';\n' +
        '\n' +
        'async function bootstrap() {\n' +
        '\tconst app = await NestFactory.create(ApplicationModule);\n' +
        '\tawait app.listen(3000);\n' +
        '}\n' +
        'bootstrap();\n'
      );
    });
  it(`should generate the right '${ options.directory }/src/app.module.ts' file content`,
    () => {
      expect(tree.readContent(`/${ options.directory }/src/app.module.ts`))
        .to.be.equal(
        'import { Module } from \'@nestjs/common\';\n' +
        'import { AppController } from \'./app.controller\';\n' +
        '\n' +
        '@Module({\n' +
        '  imports: [],\n' +
        '  controllers: [AppController],\n' +
        '  components: [],\n' +
        '})\n' +
        'export class ApplicationModule {}\n'
      );
    });
  it(`should generate the right '${ options.directory }/src/app.controller.ts' file content`,
    () => {
      expect(tree.readContent(`/${ options.directory }/src/app.controller.ts`))
        .to.be.equal(
        'import { Get, Controller } from \'@nestjs/common\';\n' +
        '\n' +
        '@Controller()\n' +
        'export class AppController {\n' +
        '  @Get()\n' +
        '  root(): string {\n' +
        '    return \'Hello World!\';\n' +
        '  }\n' +
        '}\n'
      );
    });
  it(`should generate the right '${ options.directory }/package.json' file content`,
    () => {
      expect(tree.readContent(`/${ options.directory }/package.json`))
        .to.be.equal(
        JSON.stringify(
          {
            name: options.directory,
            version: '0.0.0',
            license: 'MIT',
            scripts: {
              test: 'echo "Error: no test specified" && exit 1'
            },
            dependencies: {
              '@nestjs/common': '^4.6.4',
              '@nestjs/core': '^4.6.4',
              'reflect-metadata': '^0.1.10',
              'rxjs': '^5.5.6'
            },
            devDependencies: {
              '@nestjs/testing': '^4.6.1',
              '@types/node': '^9.3.0',
              'ts-node': '^4.1.0',
              'typescript': '^2.6.2'
            }
          },
          null,
          2)
      );
    });
  it(`should generate the right '${ options.directory }/tsconfig.json' file content`,
    () => {
      expect(tree.readContent(`${ options.directory }/tsconfig.json`))
        .to.be.equal(
        JSON.stringify({
          compilerOptions: {
            module: "commonjs",
            declaration: false,
            noImplicitAny: false,
            removeComments: true,
            noLib: false,
            emitDecoratorMetadata: true,
            experimentalDecorators: true,
            target: "es6",
            sourceMap: true,
            allowJs: true,
            outDir: "./dist"
          },
          include: [
            "src/**/*"
          ],
          exclude: [
            "node_modules",
            "**/*.spec.ts"
          ]
        }, null, 2)
      );
    });
  it(`should generate the right '${ options.directory }/tslint.json' file content`,
    () => {
      expect(tree.readContent(`${ options.directory }/tslint.json`))
        .to.be.equal(
        JSON.stringify({
          defaultSeverity: "error",
          extends: [
            "tslint:recommended"
          ],
          jsRules: {
            "no-unused-expression": true
          },
          rules: {
            "eofline": false,
            "quotemark": [
              true,
              "single"
            ],
            "indent": false,
            "member-access": [
              false
            ],
            "ordered-imports": [
              false
            ],
            "max-line-length": [
              150
            ],
            "member-ordering": [
              false
            ],
            "curly": false,
            "interface-name": [
              false
            ],
            "array-type": [
              false
            ],
            "no-empty-interface": false,
            "no-empty": false,
            "arrow-parens": false,
            "object-literal-sort-keys": false,
            "no-unused-expression": false,
            "max-classes-per-file": [
              false
            ],
            "variable-name": [
              false
            ],
            "one-line": [
              false
            ],
            "one-variable-per-declaration": [
              false
            ]
          },
          rulesDirectory: []
        }, null, 2)
      );
    });
});
