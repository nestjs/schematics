import { SetMetadata } from '@nestjs/common';

export const <%= classify(name) %> = (...args) => SetMetadata('<%= name %>', args);
