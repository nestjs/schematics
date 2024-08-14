import { existsSync, readdirSync } from 'fs';
import { Project } from 'ts-morph';
import { join as joinPath } from 'path';

const noValidationFields = ['id', 'createdAt', 'updatedAt'];
const emptyState = {
  prismaFields: [],
  classValidatorImports: [],
  enumImports: [],
  sourceFile: '',
  hasProject: false,
  foundModel: false,
  exit1: false,
  exit2: false,
};
export const prismaGenerateFields = (
  modelName: string,
  dtoValidation: 'class-validator' | 'zod' | 'no',
) => {
  const project = new Project({
    tsConfigFilePath: 'tsconfig.json',
  });

  const prismaTypesPath = resolvePrismaPath();
  if (!existsSync(prismaTypesPath)) {
    return {
      ...emptyState,
      hasProject: !!project,
      sourceFile: prismaTypesPath,
      exit1: true,
      foundModel: null,
    };
  }

  const sourceFile = project.addSourceFileAtPath(prismaTypesPath);

  const interfaceALias = sourceFile?.getTypeAlias(modelName);
  const model = interfaceALias?.getType();
  if (model) {
    const fields = model
      .getProperties()
      .filter((prop) => !noValidationFields.includes(prop.getName()))
      .map((prop) => {
        const name = prop.getName();
        const isOptional = prop.getTypeAtLocation(interfaceALias!).isNullable();
        let type = prop
          .getTypeAtLocation(interfaceALias!)
          .getNonNullableType()
          .getText();
        const isArray = prop.getTypeAtLocation(interfaceALias!).isArray();
        const isEmail = name.toLowerCase().includes('email');
        const enumValue = type.split('$Enums.')?.[1];
        type = enumValue || type;
        if (isArray) type = type.replace(/\[\]$/, '');

        return {
          name,
          type,
          isOptional,
          isArray,
          isEmail,
          isEnum: !!enumValue,
        };
      });

    const classValidatorImports = new Set();
    const enumImports = new Set();

    fields.forEach((field) => {
      if (field.isEnum) {
        enumImports.add(field.type);
      }
    });
    if (dtoValidation === 'class-validator') {
      fields.forEach((field) => {
        if (field.isEmail) {
          classValidatorImports.add('IsEmail');
        } else if (field.type === 'string') {
          classValidatorImports.add('IsString');
        } else if (field.type === 'number') {
          classValidatorImports.add('IsNumber');
        } else if (field.type === 'boolean') {
          classValidatorImports.add('IsBoolean');
        } else if (field.type === 'Date') {
          classValidatorImports.add('IsDate');
        } else if (field.isEnum) {
          classValidatorImports.add('IsEnum');
        }
        if (field.isArray) {
          classValidatorImports.add('IsArray');
        }
        if (field.isOptional) {
          classValidatorImports.add('IsOptional');
        } else {
          classValidatorImports.add('IsNotEmpty');
        }
      });
    }

    return {
      ...emptyState,
      hasProject: true,
      foundModel: true,
      sourceFile: prismaTypesPath,
      prismaFields: fields,
      classValidatorImports: Array.from(classValidatorImports),
      enumImports: Array.from(enumImports),
    };
  }
  return {
    ...emptyState,
    hasProject: !!project,
    sourceFile: prismaTypesPath,
    exit2: true,
    foundModel: !!model,
  };
};

function resolvePrismaPath(): string {
  let basePath: string;
  basePath = './node_modules';
  basePath = joinPath(
    basePath,
    readdirSync(joinPath(process.cwd(), basePath)).find((dir) =>
      dir.startsWith('.pnpm'),
    ) || '',
  );
  basePath = joinPath(
    basePath,
    readdirSync(joinPath(process.cwd(), basePath)).find((dir) =>
      dir.startsWith('@prisma+client@'),
    ) || '',
  );
  basePath = joinPath(
    basePath,
    readdirSync(joinPath(process.cwd(), basePath)).find((dir) =>
      dir.startsWith('node_modules'),
    ) || '',
  );
  if (!basePath) {
    return '';
  }
  basePath = joinPath(process.cwd(), basePath, '.prisma/client/index.d.ts');
  return basePath;
}
