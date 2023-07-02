<% if (type === 'graphql-code-first') { %>import { ArgsType, Field, ID } from '@nestjs/graphql';

@ArgsType()
export class <%= singular(classify(name)) %>Args {
  @Field(() => ID)
  id: string;
}<% } else { %>export class <%= singular(classify(name)) %>Args {}<% } %>
