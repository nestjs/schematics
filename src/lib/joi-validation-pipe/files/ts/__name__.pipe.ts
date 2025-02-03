import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { JoiValidationException } from 'unified-errors-handler';
import { ObjectSchema, ValidationOptions } from 'joi';

export enum UseValue {
  ORIGINAL = 'ORIGINAL',
  UPDATED = 'UPDATED',
  BOTH = 'BOTH',
}

@Injectable()
export class <%= classify(name) %>Pipe implements PipeTransform {

  constructor(
    private schema: ObjectSchema,
    private options: ValidationOptions = {},
    private useValue: UseValue = UseValue.ORIGINAL,
  ) {}

  transform(originalValue: any, metadata: ArgumentMetadata) {
    const { error, value } = this.schema.validate(originalValue, this.options);
    if (error) {
      throw new JoiValidationException(error);
    }
    if (this.useValue == UseValue.UPDATED) return value;
    else if (this.useValue == UseValue.BOTH) return { value, originalValue };
    else if (this.useValue == UseValue.ORIGINAL) return originalValue;
  }
}
