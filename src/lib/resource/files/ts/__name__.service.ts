<% if (crud && type !== 'graphql-code-first' && type !== 'graphql-schema-first') { %>import { Injectable } from '@nestjs/common';
import { Create<%= singular(classify(name)) %>Dto } from './input/create-<%= singular(name) %>.dto';
import { Update<%= singular(classify(name)) %>Dto } from './input/update-<%= singular(name) %>.dto';<% } else if (crud) { %>import { <%= singular(classify(name)) %> } from '@app/db/entity/<%= singular(name) %>.entity'
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';

import { <%= singular(classify(name)) %>Args } from './args/<%= singular(name) %>.args';
import { Create<%= singular(classify(name)) %>Input } from './input/create-<%= singular(name) %>.input';
import { Update<%= singular(classify(name)) %>Input } from './input/update-<%= singular(name) %>.input';<% } else { %>import { Injectable } from '@nestjs/common';<% } %>

@Injectable()
export class <%= singular(classify(name)) %>Service {<% if (crud && type !== 'graphql-code-first' && type !== 'graphql-schema-first') { %>
  create(<% if (type !== 'graphql-code-first' && type !== 'graphql-schema-first') { %>create<%= singular(classify(name)) %>Dto: Create<%= singular(classify(name)) %>Dto<% } else { %>create<%= singular(classify(name)) %>Input: Create<%= singular(classify(name)) %>Input<% } %>) {
    return 'This action adds a new <%= lowercased(singular(classify(name))) %>';
  }

  findAll() {
    return `This action returns all <%= lowercased(classify(name)) %>`;
  }

  findOne(id: number) {
    return `This action returns a #${id} <%= lowercased(singular(classify(name))) %>`;
  }

  update(id: number, <% if (type !== 'graphql-code-first' && type !== 'graphql-schema-first') { %>update<%= singular(classify(name)) %>Dto: Update<%= singular(classify(name)) %>Dto<% } else { %>update<%= singular(classify(name)) %>Input: Update<%= singular(classify(name)) %>Input<% } %>) {
    return `This action updates a #${id} <%= lowercased(singular(classify(name))) %>`;
  }

  remove(id: number) {
    return `This action removes a #${id} <%= lowercased(singular(classify(name))) %>`;
  }
<% } %><% else if (crud) { %>
  constructor(
    @InjectRepository(<%= singular(classify(name)) %>)
    private readonly <%= singular(lowercased(name)) %>Repository: Repository<<%= singular(classify(name)) %>>,
  ) {}

  create<%= singular(classify(name)) %>(
    input: Create<%= singular(classify(name)) %>Input,
  ): Promise<<%= singular(classify(name)) %>> {
    const <%= singular(lowercased(name)) %> = this.<%= singular(lowercased(name)) %>Repository.create({
      ...input,
    });
    return this.<%= singular(lowercased(name)) %>Repository.save(<%= singular(lowercased(name)) %>);
  }

  findBy<%= singular(classify(name)) %>Args(
    args: <%= singular(classify(name)) %>Args,
  ): Promise<<%= singular(classify(name)) %>[]> {
    return this.<%= singular(lowercased(name)) %>Repository.findBy(args);
  }

  findById(id: string): Promise<<%= singular(classify(name)) %> | null> {
    return this.<%= singular(lowercased(name)) %>Repository.findOneBy({ id });
  }

  update<%= singular(classify(name)) %>(
    id: string,
    update<%= singular(classify(name)) %>Input: Update<%= singular(classify(name)) %>Input,
  ): Promise<UpdateResult> {
    return this.<%= singular(lowercased(name)) %>Repository.update(
      id,
      update<%= singular(classify(name)) %>Input,
    );
  }

  remove<%= singular(classify(name)) %>(id: string): Promise<<%= singular(classify(name)) %>> {
    return this.<%= singular(lowercased(name)) %>Repository.softRemove({ id });
  }
<% } %>}
