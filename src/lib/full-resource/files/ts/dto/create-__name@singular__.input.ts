<% if (type === 'graphql-code-first') { %>import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class Create<%= singular(classify(name)) %>Input {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}<% } else { %>export class Create<%= singular(classify(name)) %>Input {}<% } %>
