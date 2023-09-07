<% if (type === 'graphql-code-first') { %>import { Field, ID, InputType } from '@nestjs/graphql';

@InputType()
export class <%= singular(classify(name)) %>WhereInput {
  @Field(() => ID, { description: 'Example field' })
  id!: string;
}<% } else { %>export class <%= singular(classify(name)) %>Args {}<% } %>
