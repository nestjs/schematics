import { Injectable } from '@nestjs/common';<% if ((crud === 'yes' || crud === 'prisma') && type !== 'graphql-code-first' && type !== 'graphql-schema-first') { %>
import { Create<%= singular(classify(name)) %>Dto } from './dto/create-<%= singular(name) %>.dto';
import { Update<%= singular(classify(name)) %>Dto } from './dto/update-<%= singular(name) %>.dto';<% } else if (crud === 'yes' || crud === 'prisma')  { %>
import { Create<%= singular(classify(name)) %>Input } from './dto/create-<%= singular(name) %>.input';
import { Update<%= singular(classify(name)) %>Input } from './dto/update-<%= singular(name) %>.input';<% } %>
<% if (crud === 'yes' || crud === 'prisma')  { %>
import { PrismaService } from '<%= prismaSource %>prisma.service';
import { Prisma, <%= classify(name) %> } from '@prisma/client';
<% } %>
@Injectable()
export class <%= classify(name) %>Service {<% if (crud  === 'prisma') { %>
      constructor(private readonly prisma: PrismaService) {}
    
      create(data: Prisma.<%= classify(name) %>CreateInput): Promise<<%= classify(name) %>> {
        return this.prisma.<%= lowercased(name) %>.create({
          data,
        });
      }
    
      findAll(): Promise<<%= classify(name) %>[]> {
        return this.prisma.<%= lowercased(name) %>.findMany();
      }
    
      findOne(id: number): Promise<<%= classify(name) %> | null> {
        return this.prisma.<%= lowercased(name) %>.findUnique({
          where: { id },
        });
      }
    
      update(id: number, data: Prisma.<%= classify(name) %>UpdateInput): Promise<<%= classify(name) %>> {
        return this.prisma.<%= lowercased(name) %>.update({
          where: { id },
          data,
        });
      }
    
      remove(id: number): Promise<<%= classify(name) %>> {
        return this.prisma.<%= lowercased(name) %>.delete({
          where: { id },
        });
      }
      <% } else if (crud ==="yes") { %>
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
<% } %>}
