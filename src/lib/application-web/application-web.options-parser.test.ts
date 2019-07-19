import {
  DEFAULT_AUTHOR,
  DEFAULT_DESCRIPTION,
  DEFAULT_LANGUAGE,
  DEFAULT_PACKAGE_MANAGER,
  DEFAULT_VERSION,
} from '../defaults';
import { ApplicationWebOptionsParser } from './application-web.options-parser';
import { ApplicationWebOptions } from './application-web.schema';

describe('ApplicationWebOptionsParser', () => {
  it('should set default options', () => {
    const options: ApplicationWebOptions = {
      name: 'name',
    };
    expect(ApplicationWebOptionsParser.parse(options)).toEqual({
      author: DEFAULT_AUTHOR,
      description: DEFAULT_DESCRIPTION,
      language: DEFAULT_LANGUAGE,
      name: options.name,
      version: DEFAULT_VERSION,
      packageManager: DEFAULT_PACKAGE_MANAGER,
      dependencies: '',
      devDependencies: '',
    });
  });

  it('should dasherize the name option', () => {
    const options: ApplicationWebOptions = {
      name: 'camelCaseName',
    };
    expect(ApplicationWebOptionsParser.parse(options)).toEqual({
      author: DEFAULT_AUTHOR,
      description: DEFAULT_DESCRIPTION,
      language: DEFAULT_LANGUAGE,
      name: 'camel-case-name',
      version: DEFAULT_VERSION,
      packageManager: DEFAULT_PACKAGE_MANAGER,
      dependencies: '',
      devDependencies: '',
    });
  });

  it('should keep author option', () => {
    const options: ApplicationWebOptions = {
      author: 'author',
      name: 'camelCaseName',
    };
    expect(ApplicationWebOptionsParser.parse(options)).toEqual({
      author: options.author,
      description: DEFAULT_DESCRIPTION,
      language: DEFAULT_LANGUAGE,
      name: 'camel-case-name',
      version: DEFAULT_VERSION,
      packageManager: DEFAULT_PACKAGE_MANAGER,
      dependencies: '',
      devDependencies: '',
    });
  });

  it('should keep description option', () => {
    const options: ApplicationWebOptions = {
      description: 'description',
      name: 'camelCaseName',
    };
    expect(ApplicationWebOptionsParser.parse(options)).toEqual({
      author: DEFAULT_AUTHOR,
      description: options.description,
      language: DEFAULT_LANGUAGE,
      name: 'camel-case-name',
      version: DEFAULT_VERSION,
      packageManager: DEFAULT_PACKAGE_MANAGER,
      dependencies: '',
      devDependencies: '',
    });
  });

  it('should keep language option', () => {
    const options: ApplicationWebOptions = {
      language: 'js',
      name: 'camelCaseName',
    };
    expect(ApplicationWebOptionsParser.parse(options)).toEqual({
      author: DEFAULT_AUTHOR,
      description: DEFAULT_DESCRIPTION,
      language: options.language,
      name: 'camel-case-name',
      version: DEFAULT_VERSION,
      packageManager: DEFAULT_PACKAGE_MANAGER,
      dependencies: '',
      devDependencies: '',
    });
  });
});
