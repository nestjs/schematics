import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { <%= classify(singular(name)) %> } from './entities/<%= singular(name) %>.entity';
import { <%= classify(name) %>Service } from './<%= name %>.service';
<% if (type === 'rest' || type === 'microservice') { %>import { <%= classify(name) %>Controller } from './<%= name %>.controller';<% } %><% if (type === 'graphql-code-first' || type === 'graphql-schema-first') { %>import { <%= classify(name) %>Resolver } from './<%= name %>.resolver';<% } %><% if (type === 'ws') { %>import { <%= classify(name) %>Gateway } from './<%= name %>.gateway';<% } %>

@Module({
  imports: [TypeOrmModule.forFeature([<%= classify(singular(name)) %>])],
  <% if (type === 'rest' || type === 'microservice') { %>controllers: [<%= classify(name) %>Controller],
  providers: [<%= classify(name) %>Service],<% } else if (type === 'graphql-code-first' || type === 'graphql-schema-first') { %>providers: [<%= classify(name) %>Resolver, <%= classify(name) %>Service],<% } else { %>providers: [<%= classify(name) %>Gateway, <%= classify(name) %>Service],<% } %><% if (type === 'rest' || type === 'microservice') { %>
  exports: [<%= classify(name) %>Service],<% } %>
})
export class <%= classify(name) %>Module {}
