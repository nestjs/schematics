<% if (type === 'graphql-code-first') { %>import { Field, ObjectType } from '@nestjs/graphql';
import { NonPositiveIntResolver } from 'graphql-scalars';

@ObjectType()
export class Update<%= singular(classify(name)) %>Output {
  @Field(() => NonPositiveIntResolver, { nullable: true })
  affectedCount?: number;
}<% } else { %>export class <%= singular(classify(name)) %>Output {}<% } %>
