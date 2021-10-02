import { normalize } from '@angular-devkit/core';
import { FilePredicate, forEach, Rule } from '@angular-devkit/schematics';

/**
 * Rule factory taken from `@angular-devkit/schematics`'s source since they didn't
 * made it public. See https://github.com/angular/angular-cli/blob/ccb5f3f6bbd22a083c8408c652058154a9a47125/packages/angular_devkit/schematics/src/index.ts#L21-L27
 *
 * (c) https://github.com/angular/angular-cli/blob/ccb5f3f6bbd22a083c8408c652058154a9a47125/packages/angular_devkit/schematics/src/rules/rename.ts
 */
export function rename(
  match: FilePredicate<boolean>,
  to: FilePredicate<string>,
): Rule {
  return forEach((entry) => {
    if (match(entry.path, entry)) {
      return {
        content: entry.content,
        path: normalize(to(entry.path, entry)),
      };
    }

    return entry;
  });
}
