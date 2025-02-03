<% if (crud && type === 'rest') { %>import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';<%
} else if (crud && type === 'microservice') { %>import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';<%
} else { %>import { Controller } from '@nestjs/common';<%
} %>
import { <%= classify(name) %>Service } from './<%= name %>.service';<% if (crud) { %>
import { Create<%= singular(classify(name)) %>Dto } from './dto/create-<%= singular(name) %>.dto';
import { Update<%= singular(classify(name)) %>Dto } from './dto/update-<%= singular(name) %>.dto';<% } %>
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JoiValidationPipe } from '../pipes/joi-validation/joi-validation.pipe';
import schema from './<%= lowercased(name) %>-validation.schema';


<% if (type === 'rest') { %> @ApiTags('<%= lowercased(name) %>')@Controller('<%= dasherize(name) %>')<% } else { %>@Controller()<% } %>
export class <%= classify(name) %>Controller {
  constructor(private readonly <%= lowercased(name) %>Service: <%= classify(name) %>Service) {}<% if (type === 'rest' && crud) { %>

  @ApiOperation({ summary: 'create <%= singular(lowercased(name)) %>' })
  @ApiResponse({ status: 201, description: 'Created.' })
  @ApiBody({
    type: Create<%= singular(classify(name)) %>Dto,
    description: '<%= singular(lowercased(name)) %> info',
  })
  @Post()
  create(@Body(new JoiValidationPipe(schema.create)) create<%= singular(classify(name)) %>Dto: Create<%= singular(classify(name)) %>Dto) {
    return this.<%= lowercased(name) %>Service.create(create<%= singular(classify(name)) %>Dto);
  }

  @ApiOperation({ summary: 'get <%= singular(lowercased(name)) %> list' })
  @Get()
  findAll() {
    return this.<%= lowercased(name) %>Service.findAll();
  }

  @ApiOperation({ summary: 'get <%= singular(lowercased(name)) %>' })
  @ApiParam({ name: 'id', description: '<%= lowercased(name) %> id' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.<%= lowercased(name) %>Service.findOne(+id);
  }

  @ApiOperation({ summary: 'update <%= singular(lowercased(name)) %>' })
  @ApiResponse({ status: 200, description: 'Updated.' })
  @ApiBody({
    type: Update<%= singular(classify(name)) %>Dto,
    description: '<%= singular(lowercased(name)) %> info',
  })
  @ApiParam({ name: 'id', description: '<%= lowercased(name) %> id' })
  @Patch(':id')
  update(@Param('id') id: string, @Body(new JoiValidationPipe(schema.update)) update<%= singular(classify(name)) %>Dto: Update<%= singular(classify(name)) %>Dto) {
    return this.<%= lowercased(name) %>Service.update(+id, update<%= singular(classify(name)) %>Dto);
  }

  @ApiOperation({ summary: 'delete <%= singular(lowercased(name)) %>' })
  @ApiResponse({ status: 200, description: 'Deleted.' })
  @ApiParam({ name: 'id', description: '<%= singular(lowercased(name)) %> id' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.<%= lowercased(name) %>Service.remove(+id);
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
