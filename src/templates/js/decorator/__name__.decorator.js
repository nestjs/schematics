import { ReflectMetadata } from '@nestjs/common';

export const <%= classify(name) %> = (...args) => ReflectMetadata('<%= name %>', args);
