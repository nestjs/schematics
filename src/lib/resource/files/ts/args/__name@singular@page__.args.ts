<% if (type === 'graphql-code-first') { %>import { DaoNodePageArgs } from '@app/graphql-type/args/dao-node-page.args';
import { ArgsType, Field } from '@nestjs/graphql';

import { <%= singular(classify(name)) %>OrderInput } from '../input/<%= singular(name) %>-order.input';
import { <%= singular(classify(name)) %>WhereInput } from '../input/<%= singular(name) %>-where.input';

@ArgsType()
export class <%= singular(classify(name)) %>PageArgs extends DaoNodePageArgs {
  @Field(() => <%= singular(classify(name)) %>OrderInput, {
    description: '排序欄位與方式',
    defaultValue: new <%= singular(classify(name)) %>OrderInput(),
  })
  order: <%= singular(classify(name)) %>OrderInput = new <%= singular(classify(name)) %>OrderInput();

  @Field(() => <%= singular(classify(name)) %>WhereInput, {
    description: '查詢條件',
    defaultValue: new <%= singular(classify(name)) %>WhereInput(),
  })
  where: <%= singular(classify(name)) %>WhereInput = new <%= singular(classify(name)) %>WhereInput();
}<% } else { %>export class <%= singular(classify(name)) %>Args {}<% } %>
