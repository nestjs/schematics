import { ReflectMetadata } from '@nestjs/common';

export const <%= classify(name) %> = (...args: string[]) => ReflectMetadata('<%= name %>', args);
