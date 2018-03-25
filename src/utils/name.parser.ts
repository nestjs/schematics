import { basename, dirname, normalize, Path } from '@angular-devkit/core';

export interface ParseOptions {
  name: string;
  path: string;
}

export interface Location {
  name: string;
  path: Path;
}

export class NameParser {
  constructor() {}

  public parse(options: ParseOptions): Location {
    const nameWithoutPath = basename(options.name as Path);
    const namePath = dirname((options.path + '/' + options.name) as Path);
    return {
      name: nameWithoutPath,
      path: normalize('/' + namePath),
    };
  }
}
