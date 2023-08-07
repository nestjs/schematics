<% if (type === 'graphql-code-first') { %>import {
  DaoNodePageArgsOrderInput,
  DaoNodePageArgsOrderValue,
} from '@app/graphql-type/input/dao-node-page-args-order.input';
import { Field, InputType } from '@nestjs/graphql';
import { Maybe } from 'graphql/jsutils/Maybe';

@InputType()
export class <%= singular(classify(name)) %>PageArgsOrderInput extends DaoNodePageArgsOrderInput {
  @Field(() => DaoNodePageArgsOrderValue, { nullable: true })
  exampleField?: Maybe<DaoNodePageArgsOrderValue>;
}<% } else { %>export class Create<%= singular(classify(name)) %>Input {}<% } %>
