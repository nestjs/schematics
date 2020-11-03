import { Create<%= singular(classify(name)) %>Input } from './create-<%= singular(name) %>.input';<% if (type === 'graphql-code-first') { %>
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class Update<%= singular(classify(name)) %>Input extends PartialType(Create<%= singular(classify(name)) %>Input) {
  @Field(() => Int)
  id: number;
}<% } else { %>
import { PartialType } from '@nestjs/graphql';

export class Update<%= singular(classify(name)) %>Input extends PartialType(Create<%= singular(classify(name)) %>Input) {
  id: number;
}<% } %>
