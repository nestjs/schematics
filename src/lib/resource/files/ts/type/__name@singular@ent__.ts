<% if (type === 'graphql-code-first') { %>import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType('<%= singular(classify(name)) %>')
export class <%= singular(classify(name)) %>Type {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}<% } else { %>export class <%= singular(classify(name)) %> {}<% } %>
