<% if (type === 'graphql-code-first') { %>import { DaoNodePage } from '@app/graphql-type/type/dao-node-page.type';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('<%= singular(classify(name)) %>Page', {
  implements: [DaoNodePage],
})
export class <%= singular(classify(name)) %>PageType implements DaoNodePage<<%= singular(classify(name)) %>Type> {
  @Field(() => [<%= singular(classify(name)) %>Type], { description: 'Nodes in this page', })
  nodes!: <%= singular(classify(name)) %>Type[];
}<% } else { %>export class <%= singular(classify(name)) %>Type {}<% } %>
