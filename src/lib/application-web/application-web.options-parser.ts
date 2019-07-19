import { strings } from '@angular-devkit/core';
import {
  DEFAULT_AUTHOR,
  DEFAULT_DESCRIPTION,
  DEFAULT_LANGUAGE,
  DEFAULT_PACKAGE_MANAGER,
  DEFAULT_VERSION,
} from '../defaults';
import { ApplicationWebOptions } from './application-web.schema';

export class ApplicationWebOptionsParser {
  public static parse(options: ApplicationWebOptions): ApplicationWebOptions {
    return {
      ...this.generateDefaultOptions(),
      ...this.dasherize(options),
    };
  }

  private static dasherize(options: ApplicationWebOptions): ApplicationWebOptions {
    return {
      ...options,
      name: strings.dasherize(options.name),
    };
  }

  private static generateDefaultOptions(): ApplicationWebOptions {
    return {
      author: DEFAULT_AUTHOR,
      description: DEFAULT_DESCRIPTION,
      dependencies: '',
      devDependencies: '',
      language: DEFAULT_LANGUAGE,
      name: '',
      packageManager: DEFAULT_PACKAGE_MANAGER,
      version: DEFAULT_VERSION,
    };
  }
}
