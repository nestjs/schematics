<% if (type === 'graphql-code-first') { %>import { ObjectType } from '@nestjs/graphql';

@ObjectType()
export class <%= singular(classify(name)) %> {}<% } else { %>export class <%= singular(classify(name)) %> {}<% } %>
