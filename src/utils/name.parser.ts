import { basename, dirname, normalize, Path } from '@angular-devkit/core';

export interface ParseOptions {
  name: string;
  path?: string;
}

export interface Location {
  name: string;
  path: Path;
}

export class NameParser {
  constructor() {}

  public parse(options: ParseOptions): Location {
    const nameWithoutPath: string = basename(options.name as Path);
    const namePath: string = dirname((options.path === undefined
      ? ''
      : options.path
    )
      .concat('/')
      .concat(options.name) as Path);
    return {
      name: nameWithoutPath,
      path: normalize('/'.concat(namePath)),
    };
  }
}
