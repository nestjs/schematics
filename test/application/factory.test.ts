import { VirtualTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { expect } from 'chai';
import * as path from 'path';
import { ApplicationOptions } from '../../src/application/schema';

describe('Application Factory', () => {
  const options: ApplicationOptions = {
    directory: 'directory',
    name: 'name',
    extension: 'ts'
  };
  let tree: UnitTestTree;
  beforeEach(() => {
    const runner: SchematicTestRunner = new SchematicTestRunner(
      '.',
      path.join(process.cwd(), 'src/collection.json')
    );
    tree = runner.runSchematic('application', options, new VirtualTree());
  });
  it('should generate Nest application files',
    () => {
      const files: string[] = tree.files;
      expect(files.find((filename) => filename === `/${ options.directory }/package.json`))
        .to.not.be.undefined;
      expect(files.find((filename) => filename === `/${ options.directory }/.nest-cli.json`))
        .to.not.be.undefined;
      expect(files.find((filename) => filename === `/${ options.directory }/src/main.ts`))
        .to.not.be.undefined;
      expect(files.find((filename) => filename === `/${ options.directory }/src/application.module.ts`))
        .to.not.be.undefined;
      expect(files.find((filename) => filename === `/${ options.directory }/tsconfig.json`))
        .to.not.be.undefined;
      expect(files.find((filename) => filename === `/${ options.directory }/tslint.json`))
        .to.not.be.undefined;
    });
  it(`should generate the right '${ options.directory }/package.json' file content`,
    () => {
      expect(tree.readContent(`/${ options.directory }/package.json`))
        .to.be.equal(
        JSON.stringify(
          {
            name: options.name,
            version: '0.0.0',
            license: 'MIT',
            scripts: {
              test: 'echo "Error: no test specified" && exit 1'
            },
            dependencies: {
              '@nestjs/common': '^4.5.9',
              '@nestjs/core': '^4.5.10',
              'reflect-metadata': '^0.1.12',
              'rxjs': '^5.5.6'
            },
            devDependencies: {
              '@nestjs/testing': '^4.5.5',
              '@types/node': '^9.3.0',
              'ts-node': '^4.1.0',
              'typescript': '^2.6.2'
            }
          },
          null,
          2)
      );
    });
  it(`should generate the right '${ options.directory }/.nest-cli.json' file content`,
    () => {
      expect(tree.readContent(`/${ options.directory }/.nest-cli.json`))
        .to.be.equal(
        JSON.stringify(
          {
            language: options.extension,
            project: {
              name: options.directory
            },
            app: {
              root: 'src',
              main: `main.${ options.extension }`
            }
          },
          null,
          2)
      );
    });
  it(`should generate the right '${ options.directory }/src/main.ts' file content`,
    () => {
      expect(tree.readContent(`/${ options.directory }/src/main.ts`))
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
  it(`should generate the right '${ options.directory }/src/application.module.ts' file content`,
    () => {
      expect(tree.readContent(`/${ options.directory }/src/application.module.ts`))
        .to.be.equal(
        'import { Module } from \'@nestjs/common\';\n' +
        '\n' +
        '@Module({})\n' +
        'export class ApplicationModule {}\n'
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
        JSON.stringify({}, null, 2)
      );
    });
});
