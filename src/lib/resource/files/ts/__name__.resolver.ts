<% if (crud && type === 'graphql-schema-first') { %>import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';

import { Create<%= singular(classify(name)) %>Input } from './input/create-<%= singular(name) %>.input';
import { Update<%= singular(classify(name)) %>Input } from './input/update-<%= singular(name) %>.input';
import { <%= singular(classify(name)) %>Service } from './<%= name %>.service';<% } %><% else if (crud && type === 'graphql-code-first') { %>import assert from 'assert';

import { Args, Context, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Maybe } from 'graphql/jsutils/Maybe';

import { AuthedGraphQLContext } from '../common/service-metadata.interface';
import { IGraphQLContext } from '../graphql-context.service';
import { <%= singular(classify(name)) %>PageArgs } from './args/<%= singular(name) %>-page.args';
import { Create<%= singular(classify(name)) %>Input } from './input/create-<%= singular(name) %>.input';
import { Remove<%= singular(classify(name)) %>Input } from './input/remove-<%= singular(name) %>.input';
import { Update<%= singular(classify(name)) %>Input } from './input/update-<%= singular(name) %>.input';
import { <%= singular(classify(name)) %>Service } from './<%= name %>.service';
import { Create<%= singular(classify(name)) %>Output } from './output/create-<%= singular(name) %>.output';
import { Remove<%= singular(classify(name)) %>Output } from './output/remove-<%= singular(name) %>.output';
import { Update<%= singular(classify(name)) %>Output } from './output/update-<%= singular(name) %>.output';
import { <%= singular(classify(name)) %>PageType } from './type/<%= page(singular(name)) %>.type';
import { <%= singular(classify(name)) %>Type } from './type/<%= singular(name) %>.type';<% } else if (crud) { %>import { Resolver } from '@nestjs/graphql';

import { Create<%= singular(classify(name)) %>Input } from './input/create-<%= singular(name) %>.input';
import { Update<%= singular(classify(name)) %>Input } from './input/update-<%= singular(name) %>.input';
import { <%= singular(classify(name)) %>Service } from './<%= name %>.service';<% } else { %>import { Resolver } from '@nestjs/graphql';

import { <%= singular(classify(name)) %>Service } from './<%= name %>.service';<% } %>

<% if (type === 'graphql-code-first' && crud) { %>@Resolver(() => <%= singular(classify(name)) %>Type)<% } else if (type === 'graphql-code-first') {%>@Resolver()<% } else { %>@Resolver('<%= singular(classify(name)) %>')<% } %>
export class <%= singular(classify(name)) %>Resolver {
  constructor(
    private readonly <%= singular(lowercased(name)) %>Service: <%= singular(classify(name)) %>Service,
  ) {}<% if (crud && type === 'graphql-code-first') { %>

  @Mutation(() => Create<%= singular(classify(name)) %>Output)
  async create<%= singular(classify(name)) %>(
    @Args('input') input: Create<%= singular(classify(name)) %>Input,
    @Context() context: IGraphQLContext,
  ): Promise<Create<%= singular(classify(name)) %>Output> {
    assert(context.user, 'User is not authenticated');
    return this.<%= singular(lowercased(name)) %>Service.createOne(input, {
      context: context as AuthedGraphQLContext,
    });
  }

  @Query(() => <%= singular(classify(name)) %>PageType)
  async <%= lowercased((singular(classify(name)))) %>Page(
    @Args() args: <%= singular(classify(name)) %>PageArgs,
  ): Promise<<%= singular(classify(name)) %>PageType> {
    return this.<%= singular(lowercased(name)) %>Service.findByPageArgs(args);
  }

  @Query(() => <%= singular(classify(name)) %>Type)
  async <%= lowercased(singular(classify(name))) %>(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Maybe<<%= singular(classify(name)) %>Type>> {
    return this.<%= singular(lowercased(name)) %>Service.findById(id);
  }

  @Mutation(() => Update<%= singular(classify(name)) %>Output)
  async update<%= singular(classify(name)) %>(
    @Args('input') input: Update<%= singular(classify(name)) %>Input,
    @Context() context: IGraphQLContext,
  ): Promise<Update<%= singular(classify(name)) %>Output> {
    assert(context.user, 'User is not authenticated');
    return this.<%= singular(lowercased(name)) %>Service.updateOne(input.id, input, {
      context: context as AuthedGraphQLContext,
    });
  }

  @Mutation(() => Remove<%= singular(classify(name)) %>Output)
  async remove<%= singular(classify(name)) %>(
    @Args('input') input: Remove<%= singular(classify(name)) %>Input,
    @Context() context: IGraphQLContext,
  ): Promise<Remove<%= singular(classify(name)) %>Output> {
    assert(context.user, 'User is not authenticated');
    return this.<%= singular(lowercased(name)) %>Service.removeOne(input.id);
  }<% } else if (crud && type === 'graphql-schema-first') {%>

  @Mutation('create<%= singular(classify(name)) %>')
  create(@Args('create<%= singular(classify(name)) %>Input') create<%= singular(classify(name)) %>Input: Create<%= singular(classify(name)) %>Input) {
    return this.<%= lowercased(name) %>Service.create(create<%= singular(classify(name)) %>Input);
  }

  @Query('<%= lowercased(classify(name)) %>')
  findAll() {
    return this.<%= lowercased(name) %>Service.findAll();
  }

  @Query('<%= lowercased(singular(classify(name))) %>')
  findOne(@Args('id') id: number) {
    return this.<%= lowercased(name) %>Service.findOne(id);
  }

  @Mutation('update<%= singular(classify(name)) %>')
  update(@Args('update<%= singular(classify(name)) %>Input') update<%= singular(classify(name)) %>Input: Update<%= singular(classify(name)) %>Input) {
    return this.<%= lowercased(name) %>Service.update(update<%= singular(classify(name)) %>Input.id, update<%= singular(classify(name)) %>Input);
  }

  @Mutation('remove<%= singular(classify(name)) %>')
  remove(@Args('id') id: number) {
    return this.<%= lowercased(name) %>Service.remove(id);
  }<% } %>
}
