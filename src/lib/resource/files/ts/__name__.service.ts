<% if (crud && type !== 'graphql-code-first' && type !== 'graphql-schema-first') { %>import { Injectable } from '@nestjs/common';
import { Create<%= singular(classify(name)) %>Dto } from './input/create-<%= singular(name) %>.dto';
import { Update<%= singular(classify(name)) %>Dto } from './input/update-<%= singular(name) %>.dto';<% } else if (crud) { %>import { <%= singular(classify(name)) %> } from '@app/db/entity/<%= singular(name) %>.entity';
import { ValidatorValidationError } from '@app/graphql-type/error/validator-validation.error';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { validate } from 'class-validator';
import { Repository } from 'typeorm';

import { <%= singular(classify(name)) %>Args } from './args/<%= singular(name) %>.args';
import { Create<%= singular(classify(name)) %>Input } from './input/create-<%= singular(name) %>.input';
import { Update<%= singular(classify(name)) %>Input } from './input/update-<%= singular(name) %>.input';
import { Create<%= singular(classify(name)) %>Output } from './output/create-<%= singular(name) %>.output';
import { Remove<%= singular(classify(name)) %>Output } from './output/remove-<%= singular(name) %>.output';
import { Update<%= singular(classify(name)) %>Output } from './output/update-<%= singular(name) %>.output';<% } else { %>import { Injectable } from '@nestjs/common';<% } %>

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

  async create<%= singular(classify(name)) %>(
    input: Create<%= singular(classify(name)) %>Input,
  ): Promise<Create<%= singular(classify(name)) %>Output> {
    const dao = this.<%= singular(lowercased(name)) %>Repository.create(input);
    const errors = await validate(dao);
    if (errors.length) {
      throw new ValidatorValidationError(errors);
    }
    const <%= singular(lowercased(name)) %> = await this.<%= singular(lowercased(name)) %>Repository.save(
      dao,
    );
    return { <%= singular(lowercased(name)) %> };
  }

  async findBy<%= singular(classify(name)) %>Args(
    args: <%= singular(classify(name)) %>Args,
  ): Promise<<%= singular(classify(name)) %>[]> {
    return this.<%= singular(lowercased(name)) %>Repository.findBy(args);
  }

  async findById(id: string): Promise<<%= singular(classify(name)) %> | null> {
    return this.<%= singular(lowercased(name)) %>Repository.findOneBy({ id });
  }

  async update<%= singular(classify(name)) %>(
    id: string,
    input: Update<%= singular(classify(name)) %>Input,
  ): Promise<Update<%= singular(classify(name)) %>Output> {
    const dao = this.<%= singular(lowercased(name)) %>Repository.create(input);
    const errors = await validate(dao);
    if (errors.length) {
      throw new ValidatorValidationError(errors);
    }
    const result = await this.<%= singular(lowercased(name)) %>Repository.update(
      id,
      input,
    );

    return {
      affectedCount: result.affected,
    };
  }

  async remove<%= singular(classify(name)) %>(id: string): Promise<Remove<%= singular(classify(name)) %>Output> {
    const result = await this.<%= singular(lowercased(name)) %>Repository.softDelete({
      id,
    });

    return {
      affectedCount: result.affected,
    };
  }
<% } %>}
