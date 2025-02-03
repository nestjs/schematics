import { Injectable } from '@nestjs/common';<% if (crud && type !== 'graphql-code-first' && type !== 'graphql-schema-first') { %>
import { Create<%= singular(classify(name)) %>Dto } from './dto/create-<%= singular(name) %>.dto';
import { Update<%= singular(classify(name)) %>Dto } from './dto/update-<%= singular(name) %>.dto';<% } else if (crud) { %>
import { Create<%= singular(classify(name)) %>Input } from './dto/create-<%= singular(name) %>.input';
import { Update<%= singular(classify(name)) %>Input } from './dto/update-<%= singular(name) %>.input';<% } %>
import { <%= classify(name) %>Repository } from './<%= lowercased(name) %>.repository';

@Injectable()
export class <%= classify(name) %>Service {<% if (crud) { %>
  constructor(
    private readonly <%= lowercased(name) %>Repository: <%= classify(name) %>Repository,
  ) {}
  create(<% if (type !== 'graphql-code-first' && type !== 'graphql-schema-first') { %>create<%= singular(classify(name)) %>Dto: Create<%= singular(classify(name)) %>Dto<% } else { %>create<%= singular(classify(name)) %>Input: Create<%= singular(classify(name)) %>Input<% } %>) {
    return this.<%= lowercased(name) %>Repository.create(create<%= singular(classify(name)) %>Dto);
  }

  findAll() {
    return this.<%= lowercased(name) %>Repository.getAll({}); 
  }

  findOne(id: number) {
    return this.<%= lowercased(name) %>Repository.getOne({ id }); 
  }

  update(id: number, <% if (type !== 'graphql-code-first' && type !== 'graphql-schema-first') { %>update<%= singular(classify(name)) %>Dto: Update<%= singular(classify(name)) %>Dto<% } else { %>update<%= singular(classify(name)) %>Input: Update<%= singular(classify(name)) %>Input<% } %>) {
    return this.<%= lowercased(name) %>Repository.update({ id }, update<%= singular(classify(name)) %>Dto);
  }

  remove(id: number) {
    return this.<%= lowercased(name) %>Repository.delete({id});
  }
<% } %>}
