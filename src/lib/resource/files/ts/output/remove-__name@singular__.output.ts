<% if (type === 'graphql-code-first') { %>import { Field, ObjectType } from '@nestjs/graphql';

import { <%= singular(classify(name)) %>Type } from '../type/<%= singular(name) %>.type';

@ObjectType()
export class Remove<%= singular(classify(name)) %>Output {
  @Field(() => <%= singular(classify(name)) %>Type)
  <%= singular(lowercased(name)) %>!: <%= singular(classify(name)) %>Type;
}<% } else { %>export class <%= singular(classify(name)) %>Output {}<% } %>
