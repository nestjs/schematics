<% if (crud && type === 'rest') { %>import { Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { RequestWithBannerUser } from '@vori/nest/libs/auth/types';
import { ApiEndpoint } from '@vori/nest/libs/decorators';
import { FindOneParams } from '@vori/nest/params/FindOneParams';<%
} else if (crud && type === 'microservice') { %>import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';<%
} else { %>import { Controller } from '@nestjs/common';<%
} %>
import { <%= classify(name) %>Service } from './<%= name %>.service';<% if (crud) { %>
import { <%= singular(classify(name)) %>Dto, Create<%= singular(classify(name)) %>Dto, Update<%= singular(classify(name)) %>Dto } from './dto/<%= singular(name) %>.dto';<% } %>

<% if (type === 'rest') { %>// TODO Add tags to group endpoints in Swagger UI
@ApiEndpoint({ prefix: '<%= dasherize(name) %>', tags: [] })<% } else { %>@Controller()<% } %>
export class <%= classify(name) %>Controller {
  constructor(private readonly <%= lowercased(name) %>Service: <%= classify(name) %>Service) {}<% if (type === 'rest' && crud) { %>

  @ApiOperation({ operationId: 'create<%= singular(classify(name)) %>' })
  @ApiCreatedResponse({ type: <%= singular(classify(name)) %>Dto })
  @ApiBadRequestResponse()
  @Post()
  public async create(
    @Req() request: RequestWithBannerUser,
    @Body() create<%= singular(classify(name)) %>Dto: Create<%= singular(classify(name)) %>Dto
  ): Promise<<%= singular(classify(name)) %>Dto> {
    const <%= singular(camelize(name)) %> = await this.<%= lowercased(name) %>Service.create(request.user, create<%= singular(classify(name)) %>Dto);
    return <%= singular(classify(name)) %>Dto.from(<%= singular(camelize(name)) %>);
  }

  @ApiOperation({ operationId: 'list<%= singular(classify(name)) %>' })
  @ApiOkResponse({ type: <%= singular(classify(name)) %>Dto, isArray: true })
  @Get()
  public async findAll(@Req() request: RequestWithBannerUser): Promise<<%= singular(classify(name)) %>Dto[]> {
    const <%= camelize(name) %> = await this.<%= lowercased(name) %>Service.findAll(request.user);
    return <%= camelize(name) %>.map(<%= singular(classify(name)) %>Dto.from);
  }

  @ApiOperation({ operationId: 'get<%= singular(classify(name)) %>' })
  @ApiNotFoundResponse()
  @ApiOkResponse({ type: <%= singular(classify(name)) %>Dto })
  @Get(':id')
  public async findOne(@Req() request: RequestWithBannerUser, @Param() params: FindOneParams) {
    const <%= singular(camelize(name)) %> = await this.<%= lowercased(name) %>Service.findOne(request.user, params.id);
    return <%= singular(classify(name)) %>Dto.from(<%= singular(camelize(name)) %>);
  }

  @ApiOperation({ operationId: 'update<%= singular(classify(name)) %>' })
  @ApiBadRequestResponse()
  @ApiNotFoundResponse()
  @ApiOkResponse({ type: <%= singular(classify(name)) %>Dto })
  @Patch(':id')
  public async update(@Req() request: RequestWithBannerUser, @Param() params: FindOneParams, @Body() update<%= singular(classify(name)) %>Dto: Update<%= singular(classify(name)) %>Dto) {
    const <%= singular(camelize(name)) %> = await this.<%= lowercased(name) %>Service.update(request.user, params.id, update<%= singular(classify(name)) %>Dto);
    return <%= singular(classify(name)) %>Dto.from(<%= singular(camelize(name)) %>);
  }

  @ApiOperation({ operationId: 'delete<%= singular(classify(name)) %>' })
  @ApiNotFoundResponse()
  @ApiNoContentResponse()
  @Delete(':id')
  public async remove(@Req() request: RequestWithBannerUser, @Param() params: FindOneParams): Promise<void> {
    await this.<%= lowercased(name) %>Service.remove(request.user, params.id);
  }<% } else if (type === 'microservice' && crud) { %>

  @MessagePattern('create<%= singular(classify(name)) %>')
  create(@Payload() create<%= singular(classify(name)) %>Dto: Create<%= singular(classify(name)) %>Dto) {
    return this.<%= lowercased(name) %>Service.create(create<%= singular(classify(name)) %>Dto);
  }

  @MessagePattern('findAll<%= classify(name) %>')
  findAll() {
    return this.<%= lowercased(name) %>Service.findAll();
  }

  @MessagePattern('findOne<%= singular(classify(name)) %>')
  findOne(@Payload() id: number) {
    return this.<%= lowercased(name) %>Service.findOne(id);
  }

  @MessagePattern('update<%= singular(classify(name)) %>')
  update(@Payload() update<%= singular(classify(name)) %>Dto: Update<%= singular(classify(name)) %>Dto) {
    return this.<%= lowercased(name) %>Service.update(update<%= singular(classify(name)) %>Dto.id, update<%= singular(classify(name)) %>Dto);
  }

  @MessagePattern('remove<%= singular(classify(name)) %>')
  remove(@Payload() id: number) {
    return this.<%= lowercased(name) %>Service.remove(id);
  }<% } %>
}
