<% if (type === 'graphql-code-first') { %>import { DaoNodePageArgs } from '@app/graphql-type/args/dao-node-page.args';
import { ArgsType, Field } from '@nestjs/graphql';
import { Maybe } from 'graphql/jsutils/Maybe';

import { <%= singular(classify(name)) %>PageArgsOrderInput } from '../input/<%= singular(name) %>-page-args-order.input';
import { <%= singular(classify(name)) %>WhereInput } from '../input/<%= singular(name) %>-where.input';

@ArgsType()
export class <%= singular(classify(name)) %>PageArgs extends DaoNodePageArgs {
  @Field(() => <%= singular(classify(name)) %>PageArgsOrderInput, {
    description: '排序欄位與方式',
    defaultValue: <%= singular(classify(name)) %>PageArgsOrderInput.default,
  })
  order: Maybe<<%= singular(classify(name)) %>PageArgsOrderInput>;

  @Field(() => <%= singular(classify(name)) %>WhereInput, {
    defaultValue: <%= singular(classify(name)) %>WhereInput.default,
  })
  where: Maybe<<%= singular(classify(name)) %>WhereInput>;
}<% } else { %>export class <%= singular(classify(name)) %>Args {}<% } %>
