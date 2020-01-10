import { SetMetadata } from '@nestjs/common';

export const <%= classify(name) %> = (...args: string[]) => SetMetadata('<%= name %>', args);
