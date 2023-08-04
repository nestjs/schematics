<% if (type === 'graphql-code-first') { %>import { DaoNodePageArgs } from '@app/graphql-type/args/dao-node-page.args';
import { ArgsType, Field } from '@nestjs/graphql';
import { NonNegativeIntResolver } from 'graphql-scalars';
import { Maybe } from 'graphql/jsutils/Maybe';

import { <%= singular(classify(name)) %>PageArgsOrderInput } from '../input/<%= singular(name) %>-page-args-order.input';
import { <%= singular(classify(name)) %>Args } from './<%= singular(name) %>.args';

@ArgsType()
export class <%= singular(classify(name)) %>PageArgs extends <%= singular(classify(name)) %>Args implements DaoNodePageArgs {
  @Field(() => NonNegativeIntResolver, {
    description: 'Maximum amount of nodes in this page',
    nullable: true,
  })
  take: Maybe<number>;

  @Field(() => NonNegativeIntResolver, {
    description: 'Amount of nodes to skip from the beginning of this page',
    nullable: true,
  })
  skip: Maybe<number>;

  @Field(() => <%= singular(classify(name)) %>PageArgsOrderInput, {
    description: '排序欄位與方式',
    defaultValue: <%= singular(classify(name)) %>PageArgsOrderInput.default,
  })
  order: Maybe<<%= singular(classify(name)) %>PageArgsOrderInput>;
}<% } else { %>export class <%= singular(classify(name)) %>Args {}<% } %>
