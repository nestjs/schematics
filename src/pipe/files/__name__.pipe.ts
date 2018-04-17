import { PipeTransform, Pipe, ArgumentMetadata } from '@nestjs/common';

@Pipe()
export class <%= classify(name) %>Pipe implements PipeTransform<any> {
  async transform(value: any, metadata: ArgumentMetadata) {
    return value;
  }
}
