import { Create<%= singular(classify(name)) %>Input } from './create-<%= singular(name) %>.input';<% if (type === 'graphql-code-first') { %>

import { Field, ID, InputType, PartialType } from '@nestjs/graphql';

@InputType()
export class Update<%= singular(classify(name)) %>Input extends PartialType(
  Create<%= singular(classify(name)) %>Input
) {
  @Field(() => ID)
  id!: string;
}<% } else { %>
import { PartialType } from '@nestjs/mapped-types';

export class Update<%= singular(classify(name)) %>Input extends PartialType(Create<%= singular(classify(name)) %>Input) {
  id: number;
}<% } %>
