<% if (type === 'graphql-code-first') { %>import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class <%= singular(classify(name)) %>WhereInput {
  static default: <%= singular(classify(name)) %>WhereInput = {
    exampleField: '',
  };

  @Field(() => String, { defaultValue: '' })
  exampleField!: string;
}<% } else { %>export class <%= singular(classify(name)) %>Args {}<% } %>
