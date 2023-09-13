import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BannerMember } from '@vori/types/User';<% if (crud && type !== 'graphql-code-first' && type !== 'graphql-schema-first') { %>
import { Create<%= singular(classify(name)) %>Dto, Update<%= singular(classify(name)) %>Dto } from './dto/<%= singular(name) %>.dto';<% } else if (crud) { %>
import { Create<%= singular(classify(name)) %>Input } from './dto/create-<%= singular(name) %>.input';
import { Update<%= singular(classify(name)) %>Input } from './dto/update-<%= singular(name) %>.input';<% } %>
import { <%= classify(singular(name)) %> } from './entities/<%= singular(name) %>.entity';

@Injectable()
export class <%= classify(name) %>Service {
  private readonly logger = new Logger(<%= classify(name) %>Service.name);

  constructor(
    @InjectRepository(<%= classify(singular(name)) %>)
    private readonly <%= camelize(name) %>Repository: Repository<<%= classify(singular(name)) %>>
  ) {}
<% if (crud) { %>
  public async create(<% if (type !== 'graphql-code-first' && type !== 'graphql-schema-first') { %>user: BannerMember, dto: Create<%= singular(classify(name)) %>Dto<% } else { %>create<%= singular(classify(name)) %>Input: Create<%= singular(classify(name)) %>Input<% } %>): Promise<<%= classify(singular(name)) %>> {<% if (crud && type == 'rest') { %>
    const <%= singular(camelize(name)) %> = this.dtoToModel(dto);

    // TODO Adjust if the data is not associated with a banner
    // NOTE: Set this only on creation. Banner IDs are not allowed to change.
      <%= singular(camelize(name)) %>.bannerID = user.bannerID;

    return this.<%= camelize(name) %>Repository.save(<%= singular(camelize(name)) %>);<% } else { %>
    return 'This action adds a new <%= lowercased(singular(classify(name))) %>';<% } %>
  }

  public async findAll(user: BannerMember): Promise<<%= classify(singular(name)) %>[]> {<% if (crud && type == 'rest') { %>
    // TODO Adjust the query if the data is not associated with a banner
    return this.<%= camelize(name) %>Repository.find({
      comment: `controller='<%= classify(name) %>Service',action='findAll'`,
      where: { bannerID: user.bannerID },
      order: {
        createdAt: 'DESC',
      },
    });<% } else { %>
    return `This action returns all <%= lowercased(classify(name)) %>`;<% } %>
  }

  public async findOne(user: BannerMember, id: string): Promise<<%= classify(singular(name)) %>> {<% if (crud && type == 'rest') { %>
    // TODO Adjust the query if the data is not associated with a banner
    return this.<%= camelize(name) %>Repository.findOneOrFail({
      comment: `controller='<%= classify(name) %>Service',action='findOne'`,
      where: { id: id.toString(), bannerID: user.bannerID },
    });<% } else { %>
    return `This action returns a #${id} <%= lowercased(singular(classify(name))) %>`;<% } %>
  }

  public async update(user: BannerMember, id: string, <% if (type !== 'graphql-code-first' && type !== 'graphql-schema-first') { %>dto: Update<%= singular(classify(name)) %>Dto<% } else { %>update<%= singular(classify(name)) %>Input: Update<%= singular(classify(name)) %>Input<% } %>): Promise<<%= classify(singular(name)) %>> {<% if (crud && type == 'rest') { %>
    const <%= singular(camelize(name)) %> = await this.findOne(user, id);
    const updates = this.dtoToModel(dto);
    return this.<%= camelize(name) %>Repository.save(
      this.<%= camelize(name) %>Repository.merge(<%= singular(camelize(name)) %>, updates)
    );<% } else { %>
    return `This action updates a #${id} <%= lowercased(singular(classify(name))) %>`;<% } %>
  }

  public async remove(user: BannerMember, id: string): Promise<void> {<% if (crud && type == 'rest') { %>
    const <%= singular(camelize(name)) %> = await this.findOne(user, id);
    await this.<%= camelize(name) %>Repository.remove(<%= singular(camelize(name)) %>);<% } else { %>
    return `This action removes a #${id} <%= lowercased(singular(classify(name))) %>`;<% } %>
  }<% if (crud && type == 'rest') { %>

  private dtoToModel(
      dto: Create<%= singular(classify(name)) %>Dto | Update<%= singular(classify(name)) %>Dto
  ): <%= classify(singular(name)) %> {
    // TODO Adjust fields as needed
    return this.<%= camelize(name) %>Repository.create({
      ...dto,
    });
  }<% } %>
<% } %>}
