<% if (type === 'graphql-code-first') { %>import { DaoNode } from '@app/graphql-type/type/dao-node.type';
import { GraphNode } from '@app/graphql-type/type/graph-node.type';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('<%= singular(classify(name)) %>', {
  implements: [GraphNode, DaoNode],
})
export class <%= singular(classify(name)) %>Type extends DaoNode {
  @Field(() => String, { nullable: true })
  exampleField?: string;
}<% } else { %>export class <%= singular(classify(name)) %>Type {}<% } %>
