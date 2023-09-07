<% if (type === 'graphql-code-first') { %>import { Field, ID, InputType } from '@nestjs/graphql';

@InputType()
export class Create<%= singular(classify(name)) %>Input {
  @Field(() => ID, { description: 'Example field' })
  id!: string;
}<% } else { %>export class Create<%= singular(classify(name)) %>Input {}<% } %>
