<% if (type === 'graphql-code-first') { %>import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class Create<%= singular(classify(name)) %>Input {
  @Field(() => String, { nullable: true })
  exampleField?: string;
}<% } else { %>export class Create<%= singular(classify(name)) %>Input {}<% } %>
