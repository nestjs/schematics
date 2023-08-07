<% if (type === 'graphql-code-first') { %>import {
  DaoNodeOrderInput,
  DaoNodeOrderValue,
} from '@app/graphql-type/input/dao-node-order.input';
import { Field, InputType } from '@nestjs/graphql';
import { Maybe } from 'graphql/jsutils/Maybe';

@InputType()
export class <%= singular(classify(name)) %>OrderInput extends DaoNodeOrderInput {
  @Field(() => DaoNodeOrderValue, { nullable: true })
  exampleField?: Maybe<DaoNodeOrderValue>;
}<% } else { %>export class Create<%= singular(classify(name)) %>Input {}<% } %>
