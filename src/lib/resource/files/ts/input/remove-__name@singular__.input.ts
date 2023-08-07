<% if (type === 'graphql-code-first') { %>import { Field, ID, InputType } from '@nestjs/graphql';

@InputType()
export class Remove<%= singular(classify(name)) %>Input {
  @Field(() => ID)
  id!: string;
}<% } else { %>

export class Remove<%= singular(classify(name)) %>Input {
  id: number;
}<% } %>
