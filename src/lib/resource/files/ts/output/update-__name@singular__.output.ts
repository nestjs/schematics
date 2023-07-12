<% if (type === 'graphql-code-first') { %>import { Field, ObjectType } from '@nestjs/graphql';
import { NonNegativeIntResolver } from 'graphql-scalars';

@ObjectType()
export class Update<%= singular(classify(name)) %>Output {
  @Field(() => NonNegativeIntResolver, { nullable: true })
  affectedCount?: number;
}<% } else { %>export class <%= singular(classify(name)) %>Output {}<% } %>
