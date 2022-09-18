import { Module } from '@nestjs/common';
import { <%= classify(name) %>Service } from './<%= name %>.service';
<% if (type === 'rest' || type === 'microservice' || type === 'cqrs') { %>import { <%= classify(name) %>Controller } from './<%= name %>.controller';<% } %><% if (type === 'graphql-code-first' || type === 'graphql-schema-first') { %>import { <%= classify(name) %>Resolver } from './<%= name %>.resolver';<% } %><% if (type === 'ws') { %>import { <%= classify(name) %>Gateway } from './<%= name %>.gateway';<% } %>
<% if (type === 'cqrs') { %>
import { TypeOrmModule } from '@nestjs/typeorm';
import { <%= singular(classify(name)) %> } from './entities/<%= singular(name) %>.entity';
import { Create<%= singular(classify(name)) %>Handler } from './command-handlers/create-<%= singular(name) %>.handler';
import { Update<%= singular(classify(name)) %>Handler } from './command-handlers/update-<%= singular(name) %>.handler';
import { Remove<%= singular(classify(name)) %>Handler } from './command-handlers/remove-<%= singular(name) %>.handler';
import { <%= singular(classify(name)) %>CreatedHandler } from './event-handlers/<%= singular(name) %>-created.handler';
import { <%= singular(classify(name)) %>UpdatedHandler } from './event-handlers/<%= singular(name) %>-updated.handler';
import { <%= singular(classify(name)) %>RemovedHandler } from './event-handlers/<%= singular(name) %>-removed.handler';
import { CqrsModule } from '@nestjs/cqrs';
import { <%= singular(classify(name)) %>Sagas } from './<%= name %>.saga';
import { <%= classify(name) %>Consumer } from './consumers/<%= singular(name) %>.consumer';
import { BullModule } from '@nestjs/bull';

export const CommandHandlers = [
  Create<%= singular(classify(name)) %>Handler,
  Update<%= singular(classify(name)) %>Handler,
  Remove<%= singular(classify(name)) %>Handler,
];
export const EventHandlers = [
  <%= singular(classify(name)) %>CreatedHandler,
  <%= singular(classify(name)) %>UpdatedHandler,
  <%= singular(classify(name)) %>RemovedHandler,
];
export const Consumers = [<%= classify(name) %>Consumer];<% } %>

@Module({
  <% if (type === 'cqrs') { %>imports: [
    TypeOrmModule.forFeature([<%= singular(classify(name)) %>]),
    CqrsModule,
    BullModule.registerQueue({
      name: '<%= singular(name) %>-queue',
    }),
  ],<% } %><% if (type === 'rest' || type === 'microservice') { %>controllers: [<%= classify(name) %>Controller],
  providers: [<%= classify(name) %>Service]<% } else if (type === 'graphql-code-first' || type === 'graphql-schema-first') { %>providers: [<%= classify(name) %>Resolver, <%= classify(name) %>Service]<% } else if (type === 'cqrs') { %>controllers: [<%= classify(name) %>Controller],
    providers: [<%= classify(name) %>Service, <%= singular(classify(name)) %>Sagas, ...CommandHandlers, ...EventHandlers, ...Consumers]<% } else { %>providers: [<%= classify(name) %>Gateway, <%= classify(name) %>Service]<% } %>
})
export class <%= classify(name) %>Module {}