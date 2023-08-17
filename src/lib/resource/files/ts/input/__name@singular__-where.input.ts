<% if (type === 'graphql-code-first') { %>import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class <%= singular(classify(name)) %>WhereInput {
  @Field(() => String, { nullable: true })
  exampleField?: string;
}<% } else { %>export class <%= singular(classify(name)) %>Args {}<% } %>
