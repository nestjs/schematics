import * as ts from 'typescript';

export function compileAndCaptureProviders(
  content: string,
  serviceContent = 'export class UsersService {}\n',
): {
  generatedService: Function;
  providers: unknown[];
} {
  const files = new Map([
    ['/virtual/app.module.ts', content],
    [
      '/virtual/other.ts',
      'export class Other {}\nexport class OtherService {}\n',
    ],
    ['/virtual/users/users.service.ts', serviceContent],
    [
      '/virtual/nest-common.d.ts',
      "declare module '@nestjs/common' { export function Module(metadata: { providers: unknown[] }): ClassDecorator; export function Injectable(): ClassDecorator; }\n",
    ],
  ]);
  const options: ts.CompilerOptions = {
    experimentalDecorators: true,
    module: ts.ModuleKind.CommonJS,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    noEmit: true,
    strict: true,
    skipDefaultLibCheck: true,
    target: ts.ScriptTarget.ES2022,
    types: [],
  };
  const host = ts.createCompilerHost(options);
  const originalFileExists = host.fileExists.bind(host);
  const originalReadFile = host.readFile.bind(host);
  const originalGetSourceFile = host.getSourceFile.bind(host);
  host.fileExists = (fileName) =>
    files.has(fileName) || originalFileExists(fileName);
  host.readFile = (fileName) =>
    files.get(fileName) ?? originalReadFile(fileName);
  host.getSourceFile = (
    fileName,
    languageVersion,
    onError,
    shouldCreateNew,
  ) => {
    const text = files.get(fileName);
    return text === undefined
      ? originalGetSourceFile(
          fileName,
          languageVersion,
          onError,
          shouldCreateNew,
        )
      : ts.createSourceFile(fileName, text, languageVersion);
  };
  host.resolveModuleNames = (moduleNames) =>
    moduleNames.map((moduleName) => {
      const fileName =
        moduleName === '@nestjs/common'
          ? '/virtual/nest-common.d.ts'
          : moduleName === './other'
            ? '/virtual/other.ts'
            : moduleName === './users/users.service' ||
                moduleName === './users/users.service.js'
              ? '/virtual/users/users.service.ts'
              : undefined;
      return fileName
        ? { resolvedFileName: fileName, extension: ts.Extension.Ts }
        : undefined;
    });
  const program = ts.createProgram([...files.keys()], options, host);
  expect(
    ts
      .getPreEmitDiagnostics(program)
      .map((diagnostic) =>
        ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'),
      ),
  ).toEqual([]);

  const other = class Other {};
  const otherService = class OtherService {};
  const emitted = ts.transpileModule(content, {
    compilerOptions: {
      experimentalDecorators: true,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  let providers: unknown[] = [];
  const requireModule = (specifier: string) => {
    if (specifier === '@nestjs/common') {
      return {
        Module: (metadata: { providers: unknown[] }) => {
          providers = metadata.providers;
          return (target: unknown) => target;
        },
        Injectable: () => (target: unknown) => target,
      };
    }
    if (
      specifier === './users/users.service' ||
      specifier === './users/users.service.js'
    ) {
      return serviceExports;
    }
    if (specifier === './other') {
      return { Other: other, OtherService: otherService };
    }
    throw new Error(`Unexpected module: ${specifier}`);
  };
  const serviceExports: { UsersService?: Function } = {};
  const serviceEmitted = ts.transpileModule(serviceContent, {
    compilerOptions: options,
  }).outputText;
  new Function('require', 'exports', serviceEmitted)(
    requireModule,
    serviceExports,
  );
  expect(serviceExports.UsersService).toBeTypeOf('function');
  new Function('require', 'exports', emitted)(requireModule, {});
  return { generatedService: serviceExports.UsersService!, providers };
}
