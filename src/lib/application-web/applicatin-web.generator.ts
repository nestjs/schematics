import { join, Path, strings } from '@angular-devkit/core';
import {
  apply,
  mergeWith,
  move,
  Rule,
  Source,
  template,
  url,
} from '@angular-devkit/schematics';
import { ApplicationWebOptions } from './application-web.schema';

export class ApplicationWebGenerator {
  private readonly options: ApplicationWebOptions;

  constructor(options: ApplicationWebOptions) {
    this.options = options;
  }

  public generate(): Rule {
    return mergeWith(apply(this.source, this.rules));
  }

  private get source(): Source {
    return url(join('./files' as Path, this.options.language));
  }

  private get rules(): Rule[] {
    return [
      template({
        ...strings,
        ...this.options,
      }),
      move(this.options.name),
    ];
  }
}
