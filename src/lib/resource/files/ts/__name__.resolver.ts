<% if (crud && type === 'graphql-schema-first') { %>import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';

import { Create<%= singular(classify(name)) %>Input } from './input/create-<%= singular(name) %>.input';
import { Update<%= singular(classify(name)) %>Input } from './input/update-<%= singular(name) %>.input';
import { <%= singular(classify(name)) %>Service } from './<%= name %>.service';<% } %><% else if (crud && type === 'graphql-code-first') { %>import { Maybe } from '@apollo/federation';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UpdateResult } from 'typeorm';

import { <%= singular(classify(name)) %>Args } from './args/<%= singular(name) %>.args';
import { Create<%= singular(classify(name)) %>Input } from './input/create-<%= singular(name) %>.input';
import { Update<%= singular(classify(name)) %>Input } from './input/update-<%= singular(name) %>.input';
import { <%= singular(classify(name)) %>Service } from './<%= name %>.service';
import { <%= singular(classify(name)) %>Output } from './output/<%= singular(name) %>.output';
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

  @Mutation(() => <%= singular(classify(name)) %>Type)
  async create<%= singular(classify(name)) %>(
    @Args('input') input: Create<%= singular(classify(name)) %>Input,
  ): Promise<<%= singular(classify(name)) %>Output> {
    return this.<%= singular(lowercased(name)) %>Service.create<%= singular(classify(name)) %>(input);
  }

  @Query(() => [<%= singular(classify(name)) %>Type])
  <%= lowercased(plural(classify(name))) %>(
    @Args() args: <%= singular(classify(name)) %>Args,
  ): Promise<Maybe<<%= singular(classify(name)) %>Type[]>> {
    return this.<%= singular(lowercased(name)) %>Service.findBy<%= singular(classify(name)) %>Args(args);
  }

  @Query(() => <%= singular(classify(name)) %>Type)
  <%= lowercased(singular(classify(name))) %>(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Maybe<<%= singular(classify(name)) %>Type>> {
    return this.<%= singular(lowercased(name)) %>Service.findById(id);
  }

  @Mutation(() => <%= singular(classify(name)) %>Type)
  update<%= singular(classify(name)) %>(
    @Args('input') input: Update<%= singular(classify(name)) %>Input,
  ): Promise<Maybe<UpdateResult>> {
    return this.<%= singular(lowercased(name)) %>Service.update<%= singular(classify(name)) %>(
      input.id,
      input,
    );
  }

  @Mutation(() => <%= singular(classify(name)) %>Type)
  remove<%= singular(classify(name)) %>(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Maybe<<%= singular(classify(name)) %>Type>> {
    return this.<%= singular(lowercased(name)) %>Service.remove<%= singular(classify(name)) %>(id);
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
