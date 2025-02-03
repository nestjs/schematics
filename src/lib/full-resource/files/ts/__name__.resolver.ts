import { Resolver<% if (crud && type === 'graphql-schema-first') { %>, Query, Mutation, Args<% } else if (crud && type === 'graphql-code-first') { %>, Query, Mutation, Args, Int<% } %> } from '@nestjs/graphql';
import { <%= classify(name) %>Service } from './<%= name %>.service';<% if (crud && type === 'graphql-code-first') { %>
import { <%= singular(classify(name)) %> } from './entities/<%= singular(name) %>.entity';<% } %><% if (crud) { %>
import { Create<%= singular(classify(name)) %>Input } from './dto/create-<%= singular(name) %>.input';
import { Update<%= singular(classify(name)) %>Input } from './dto/update-<%= singular(name) %>.input';<% } %>

<% if (type === 'graphql-code-first' && crud) { %>@Resolver(() => <%= singular(classify(name)) %>)<% } else if (type === 'graphql-code-first') {%>@Resolver()<% } else { %>@Resolver('<%= singular(classify(name)) %>')<% } %>
export class <%= classify(name) %>Resolver {
  constructor(private readonly <%= lowercased(name) %>Service: <%= classify(name) %>Service) {}<% if (crud && type === 'graphql-code-first') { %>

  @Mutation(() => <%= singular(classify(name)) %>)
  create<%= singular(classify(name)) %>(@Args('create<%= singular(classify(name)) %>Input') create<%= singular(classify(name)) %>Input: Create<%= singular(classify(name)) %>Input) {
    return this.<%= lowercased(name) %>Service.create(create<%= singular(classify(name)) %>Input);
  }

  @Query(() => [<%= singular(classify(name)) %>], { name: '<%= lowercased(classify(name)) %>' })
  findAll() {
    return this.<%= lowercased(name) %>Service.findAll();
  }

  @Query(() => <%= singular(classify(name)) %>, { name: '<%= lowercased(singular(classify(name))) %>' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.<%= lowercased(name) %>Service.findOne(id);
  }

  @Mutation(() => <%= singular(classify(name)) %>)
  update<%= singular(classify(name)) %>(@Args('update<%= singular(classify(name)) %>Input') update<%= singular(classify(name)) %>Input: Update<%= singular(classify(name)) %>Input) {
    return this.<%= lowercased(name) %>Service.update(update<%= singular(classify(name)) %>Input.id, update<%= singular(classify(name)) %>Input);
  }

  @Mutation(() => <%= singular(classify(name)) %>)
  remove<%= singular(classify(name)) %>(@Args('id', { type: () => Int }) id: number) {
    return this.<%= lowercased(name) %>Service.remove(id);
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
