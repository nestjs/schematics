<% if (crud && type !== 'graphql-code-first' && type !== 'graphql-schema-first') { %>import { Injectable } from '@nestjs/common';
import { Create<%= singular(classify(name)) %>Dto } from './input/create-<%= singular(name) %>.dto';
import { Update<%= singular(classify(name)) %>Dto } from './input/update-<%= singular(name) %>.dto';<% } else if (crud) { %>import { <%= singular(classify(name)) %> } from '@app/db/entity/<%= singular(name) %>.entity';
import { DaoIdNotFoundError } from '@app/graphql-type/error/dao-id-not-found.error';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { ServiceMetadata } from '../common/service-metadata.interface';
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
    private readonly manager: EntityManager,
    @InjectRepository(<%= singular(classify(name)) %>)
    private readonly <%= singular(lowercased(name)) %>Repo: Repository<<%= singular(classify(name)) %>>,
  ) {}

  async create<%= singular(classify(name)) %>(
    input: Create<%= singular(classify(name)) %>Input,
    metadata?: Pick<ServiceMetadata, 'manager'>,
  ): Promise<Create<%= singular(classify(name)) %>Output> {
    const create = async (manager: EntityManager) => {
      const <%= singular(lowercased(name)) %>Repo = manager.getRepository(<%= singular(classify(name)) %>);

      const <%= singular(lowercased(name)) %> = <%= singular(lowercased(name)) %>Repo.create(input);

      await <%= singular(lowercased(name)) %>Repo.save(
        <%= singular(lowercased(name)) %>,
      );

      return { <%= singular(lowercased(name)) %> };
    };

    if (metadata?.manager) {
      return create(metadata.manager);
    }

    return this.manager.transaction('READ COMMITTED', create);
  }

  async findBy<%= singular(classify(name)) %>Args(
    args: <%= singular(classify(name)) %>Args,
    metadata?: Pick<ServiceMetadata, 'manager'>,
  ): Promise<<%= singular(classify(name)) %>[]> {
    if (metadata?.manager) {
      const <%= singular(lowercased(name)) %>Repo = metadata.manager.getRepository(<%= singular(classify(name)) %>);
      return <%= singular(lowercased(name)) %>Repo.findBy(args);
    }

    return this.<%= singular(lowercased(name)) %>Repo.findBy(args);
  }

  async findById(
    id: string,
    metadata?: Pick<ServiceMetadata, 'manager'>,
  ): Promise<<%= singular(classify(name)) %> | null> {
    if (metadata?.manager) {
      const <%= singular(lowercased(name)) %>Repo = metadata.manager.getRepository(<%= singular(classify(name)) %>);
      return <%= singular(lowercased(name)) %>Repo.findOneBy({ id });
    }

    return this.<%= singular(lowercased(name)) %>Repo.findOneBy({ id });
  }

  async update<%= singular(classify(name)) %>(
    id: string,
    input: Update<%= singular(classify(name)) %>Input,
    metadata?: Pick<ServiceMetadata, 'manager'>,
  ): Promise<Update<%= singular(classify(name)) %>Output> {
    const update = async (manager: EntityManager) => {
      const <%= singular(lowercased(name)) %>Repo = manager.getRepository(<%= singular(classify(name)) %>);

      const <%= singular(lowercased(name)) %> = await <%= singular(lowercased(name)) %>Repo.preload({
        ...input,
        id,
      });
      if (!<%= singular(lowercased(name)) %>) {
        throw new DaoIdNotFoundError(<%= singular(classify(name)) %>, id);
      }

      await <%= singular(lowercased(name)) %>Repo.save(
        <%= singular(lowercased(name)) %>,
      );

      return {
        <%= singular(lowercased(name)) %>,
      };
    };

    if (metadata?.manager) {
      return update(metadata.manager);
    }

    return this.manager.transaction('READ COMMITTED', update);
  }

  async remove<%= singular(classify(name)) %>(
    id: string,
    metadata?: Pick<ServiceMetadata, 'manager'>,
  ): Promise<Remove<%= singular(classify(name)) %>Output> {
    const remove = async (manager: EntityManager) => {
      const <%= singular(lowercased(name)) %>Repo = manager.getRepository(<%= singular(classify(name)) %>);

      const <%= singular(lowercased(name)) %> = await <%= singular(lowercased(name)) %>Repo.findOneBy({ id });
      if (!<%= singular(lowercased(name)) %>) {
        throw new DaoIdNotFoundError(<%= singular(classify(name)) %>, id);
      }

      const result = await <%= singular(lowercased(name)) %>Repo.softRemove(<%= singular(lowercased(name)) %>);

      return {
        <%= singular(lowercased(name)) %>: result,
      };
    };

    if (metadata?.manager) {
      return remove(metadata.manager);
    }

    return this.manager.transaction('READ COMMITTED', remove);
  }
<% } %>}
