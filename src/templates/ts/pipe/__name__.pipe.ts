import { ArgumentMetadata, Pipe, PipeTransform } from '@nestjs/common';

@Pipe()
export class <%= classify(name) %>Pipe implements PipeTransform {
  async transform(value: any, metadata: ArgumentMetadata) {
    return value;
  }
}
