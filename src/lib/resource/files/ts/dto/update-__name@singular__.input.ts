import { PartialType } from '@nestjs/mapped-types';
import { Create<%= singular(classify(name)) %>Input } from './create-<%= singular(name) %>.input';<% if (type === 'graphql-code-first') { %>
import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class Update<%= singular(classify(name)) %>Input extends PartialType(Create<%= singular(classify(name)) %>Input) {
  @Field(() => Int)
  id: number;
}<% } else { %>

export class Update<%= singular(classify(name)) %>Input extends PartialType(Create<%= singular(classify(name)) %>Input) {
  id: number;
}<% } %>