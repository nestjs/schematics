import { Rule, Tree } from '@angular-devkit/schematics';
import { isObjectLiteralExpression, isPropertyAssignment } from 'typescript';
import {
  addPackageJsonDependency,
  getPackageJsonDependency,
} from '../../../utils/dependencies.utils.js';
import {
  applyEdits,
  collectSourceFiles,
  findProperty,
  forEachDescendant,
  getSourceRoots,
  importsAnyOf,
  parseMajor,
  parseSource,
  TextEdit,
  UpgradeReport,
} from '../upgrade.utils.js';

const JOI_V18 = '^18.0.0';

/**
 * `@nestjs/config` v12 validates through Standard Schema. Joi keeps working
 * (v18+ implements the spec), but Joi-specific settings previously passed
 * directly under `validationOptions` now live under
 * `validationOptions.libraryOptions`.
 */
export function migrateConfigModule(report: UpgradeReport): Rule {
  return (tree: Tree) => {
    if (!getPackageJsonDependency(tree, '@nestjs/config')) {
      return tree;
    }

    for (const path of collectSourceFiles(tree, getSourceRoots(tree))) {
      const content = tree.read(path)!.toString('utf-8');
      if (
        !content.includes('@nestjs/config') ||
        !content.includes('validationOptions')
      ) {
        continue;
      }
      const source = parseSource(path, content);
      if (!importsAnyOf(source, ['@nestjs/config'])) {
        continue;
      }
      const edits: TextEdit[] = [];
      forEachDescendant(source, (node) => {
        if (!isObjectLiteralExpression(node)) {
          return;
        }
        const property = findProperty(node, 'validationOptions');
        if (!property || !isPropertyAssignment(property)) {
          return;
        }
        const initializer = property.initializer;
        if (!isObjectLiteralExpression(initializer)) {
          report.action(
            `${path}: "validationOptions" is not an inline object, so it could not be migrated automatically. Library-specific settings (e.g. Joi's "allowUnknown"/"abortEarly") must now be nested under "validationOptions.libraryOptions".`,
          );
          return;
        }
        if (
          initializer.properties.length === 0 ||
          findProperty(initializer, 'libraryOptions')
        ) {
          return;
        }
        edits.push({
          start: initializer.getStart(source),
          end: initializer.getEnd(),
          text: `{ libraryOptions: ${initializer.getText(source)} }`,
        });
        report.change(
          `${path}: moved "validationOptions" settings under "validationOptions.libraryOptions"`,
        );
      });
      if (edits.length > 0) {
        tree.overwrite(path, applyEdits(content, edits));
      }
    }

    const joi = getPackageJsonDependency(tree, 'joi');
    const joiMajor = parseMajor(joi?.version);
    if (joi && joiMajor !== null && joiMajor < 18) {
      addPackageJsonDependency(tree, {
        ...joi,
        version: JOI_V18,
        overwrite: true,
      });
      report.change(
        `Updated "joi" from "${joi.version}" to "${JOI_V18}" (Joi v18 implements Standard Schema, required by @nestjs/config v12)`,
      );
    }
    report.note(
      '@nestjs/config now validates with Standard Schema: "validationSchema" accepts Zod, Valibot, ArkType (and Joi v18+) schemas. See https://docs.nestjs.com/techniques/configuration#schema-validation',
    );
    return tree;
  };
}
