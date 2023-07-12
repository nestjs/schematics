<% if (type === 'graphql-code-first') { %>import { Field, ID, InputType, PartialType } from '@nestjs/graphql';

import { Create<%= singular(classify(name)) %>Input } from './create-<%= singular(name) %>.input';

@InputType()
export class Remove<%= singular(classify(name)) %>Input extends PartialType(
  Create<%= singular(classify(name)) %>Input,
) {
  @Field(() => ID)
  id!: string;
}<% } else { %>import { Create<%= singular(classify(name)) %>Input } from './create-<%= singular(name) %>.input';
import { PartialType } from '@nestjs/mapped-types';

export class Remove<%= singular(classify(name)) %>Input extends PartialType(Create<%= singular(classify(name)) %>Input) {
  id: number;
}<% } %>
