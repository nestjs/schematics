import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BannerMember } from '@vori/types/User';<% if (crud && type !== 'graphql-code-first' && type !== 'graphql-schema-first') { %>
import { Create<%= singular(classify(name)) %>Dto, Update<%= singular(classify(name)) %>Dto } from './dto/<%= singular(name) %>.dto';<% } else if (crud) { %>
import { Create<%= singular(classify(name)) %>Input } from './dto/create-<%= singular(name) %>.input';
import { Update<%= singular(classify(name)) %>Input } from './dto/update-<%= singular(name) %>.input';<% } %>
import { <%= classify(singular(name)) %> } from './entities/<%= singular(name) %>.entity';

@Injectable()
export class <%= classify(name) %>Service {
  constructor(
    @InjectRepository(<%= classify(singular(name)) %>)
    private readonly <%= camelize(name) %>Repository: Repository<<%= classify(singular(name)) %>>
  ) {}
<% if (crud) { %>
  public async create(<% if (type !== 'graphql-code-first' && type !== 'graphql-schema-first') { %>user: BannerMember, create<%= singular(classify(name)) %>Dto: Create<%= singular(classify(name)) %>Dto<% } else { %>create<%= singular(classify(name)) %>Input: Create<%= singular(classify(name)) %>Input<% } %>): Promise<<%= classify(singular(name)) %>> {
    return 'This action adds a new <%= lowercased(singular(classify(name))) %>';
  }

  public async findAll(user: BannerMember): Promise<<%= classify(singular(name)) %>[]> {
    return `This action returns all <%= lowercased(classify(name)) %>`;
  }

  public async findOne(user: BannerMember, id: string): Promise<<%= classify(singular(name)) %>> {
    return `This action returns a #${id} <%= lowercased(singular(classify(name))) %>`;
  }

  public async update(user: BannerMember, id: string, <% if (type !== 'graphql-code-first' && type !== 'graphql-schema-first') { %>update<%= singular(classify(name)) %>Dto: Update<%= singular(classify(name)) %>Dto<% } else { %>update<%= singular(classify(name)) %>Input: Update<%= singular(classify(name)) %>Input<% } %>): Promise<<%= classify(singular(name)) %>> {
    return `This action updates a #${id} <%= lowercased(singular(classify(name))) %>`;
  }

  public async remove(user: BannerMember, id: string): Promise<void> {
    return `This action removes a #${id} <%= lowercased(singular(classify(name))) %>`;
  }
<% } %>}
