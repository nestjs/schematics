import { Rule } from '@angular-devkit/schematics';
import { ApplicationWebGenerator } from './applicatin-web.generator';
import { ApplicationWebOptionsParser } from './application-web.options-parser';
import { ApplicationWebOptions } from './application-web.schema';

export function main(options: ApplicationWebOptions): Rule {
  return new ApplicationWebGenerator(ApplicationWebOptionsParser.parse(options)).generate();
}
