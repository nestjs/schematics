import { Injectable } from '@nestjs/common';<% if (crud && type !== 'graphql-code-first' && type !== 'graphql-schema-first') { %>
import { Create<%= singular(classify(name)) %>Dto } from './dto/create-<%= singular(name) %>.dto';
import { Update<%= singular(classify(name)) %>Dto } from './dto/update-<%= singular(name) %>.dto';<% } else if (crud) { %>
import { Create<%= singular(classify(name)) %>Input } from './dto/create-<%= singular(name) %>.input';
import { Update<%= singular(classify(name)) %>Input } from './dto/update-<%= singular(name) %>.input';<% } %>
<% if (crud && type === 'cqrs') { %>
import { CommandBus, EventBus } from '@nestjs/cqrs';
import { Create<%= singular(classify(name)) %>Command } from './commands/create-<%= singular(name) %>.command';
import { Update<%= singular(classify(name)) %>Command } from './commands/update-<%= singular(name) %>.command';
import { Remove<%= singular(classify(name)) %>Command } from './commands/remove-<%= singular(name) %>.command';
import { <%= singular(classify(name)) %>CreatedEvent } from './events/<%= singular(name) %>-created.event';
import { <%= singular(classify(name)) %>UpdatedEvent } from './events/<%= singular(name) %>-updated.event';
import { <%= singular(classify(name)) %>RemovedEvent } from './events/<%= singular(name) %>-removed.event';

import { <%= singular(classify(name)) %> } from './entities/<%= singular(name) %>.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue, Job } from 'bull';
import { InjectQueue } from '@nestjs/bull';
<% } %>
@Injectable()
export class <%= classify(name) %>Service {<% if (crud) { %>
  <% if (type === 'cqrs') { %>constructor(
    @InjectRepository(<%= singular(classify(name)) %>)
    private readonly <%= singular(name) %>Repository: Repository<<%= singular(classify(name)) %>>,
    private commandBus: CommandBus,
    private eventBus: EventBus,
    @InjectQueue('<%= singular(name) %>-queue') private <%= singular(name) %>Queue: Queue,
  ) {}
  <% } %><% if (type === 'cqrs') { %>
  async fireCreate(dto: Create<%= singular(classify(name)) %>Dto) {
    const job: Job = await this.commandBus.execute(new Create<%= singular(classify(name)) %>Command(dto));
    return job.id;
  }
  <% } %><% if (type === 'cqrs') { %>
  async <% } %>create(<% if (type !== 'graphql-code-first' && type !== 'graphql-schema-first') { %>create<%= singular(classify(name)) %>Dto: Create<%= singular(classify(name)) %>Dto<% if (type === 'cqrs') { %>, job?: Job<% } %><% } else { %>create<%= singular(classify(name)) %>Input: Create<%= singular(classify(name)) %>Input<% } %>) {
    <% if (type === 'cqrs') { %>const created = await this.<%= singular(name) %>Repository.save(create<%= singular(classify(name)) %>Dto);
      if (created) {
        if (job) {
          job.update({ id: created.id });
          await job.progress(100);
        }
        this.eventBus.publish(new <%= singular(classify(name)) %>CreatedEvent(created.id));
      }<% } else { %>return 'This action adds a new <%= lowercased(singular(classify(name))) %>';<% } %>
  }

  findAll() {
    return `This action returns all <%= lowercased(classify(name)) %>`;
  }

  findOne(id: number) {
    return `This action returns a #${id} <%= lowercased(singular(classify(name))) %>`;
  }
<% if (type === 'cqrs') { %>
  async fireUpdate(id: number, dto: Update<%= singular(classify(name)) %>Dto) {
    const job: Job = await this.commandBus.execute(new Update<%= singular(classify(name)) %>Command(id, dto));
    return job.id;
  }
<% } %>
  <% if (type === 'cqrs') { %>async <% } %>update(id: number, <% if (type !== 'graphql-code-first' && type !== 'graphql-schema-first') { %>update<%= singular(classify(name)) %>Dto: Update<%= singular(classify(name)) %>Dto<% if (type === 'cqrs') { %>, job?: Job<% } %><% } else { %>update<%= singular(classify(name)) %>Input: Update<%= singular(classify(name)) %>Input<% } %>) {
    <% if (type === 'cqrs') { %>const updated = await this.<%= singular(name) %>Repository.save({id, ...update<%= singular(classify(name)) %>Dto});
    if (updated) {
      if (job) {
        job.update({ id: updated.id });
        await job.progress(100);
      }
      this.eventBus.publish(new <%= singular(classify(name)) %>UpdatedEvent(updated.id));
    }<% } else { %>return `This action updates a #${id} <%= lowercased(singular(classify(name))) %>`;<% } %>
  }
<% if (type === 'cqrs') { %>
  async fireRemove(id: number) {
    const job: Job = await this.commandBus.execute(new Remove<%= singular(classify(name)) %>Command(id));
    return job.id;
  }
<% } %>
  <% if (type === 'cqrs') { %>async <% } %>remove(id: number<% if (type === 'cqrs') { %>, job?: Job<% } %>) {
    <% if (type === 'cqrs') { %>const removed = await this.<%= singular(name) %>Repository.delete(id);
      if (removed.affected === 1) {
        if (job) {
          await job.progress(100);
        }
        this.eventBus.publish(new <%= singular(classify(name)) %>RemovedEvent(job.data.id));
      }
      else if(job) {
        await job.discard();
      }<% } else { %>return `This action removes a #${id} <%= lowercased(singular(classify(name))) %>`;<% } %>
  }
<% } %>}
