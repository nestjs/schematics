import { Controller<% if (resource) { %>, Post, Get, Put, Delete, Param <% } %> } from '@nestjs/common';

@Controller('<%= dasherize(name) %>')
export class <%= classify(name) %>Controller {
  <% if (resource) { %>
  @Post()
  create() {
  return 'This action creates a new item'
  }

  @Get()
  findAll() {
  return 'This action returns all items'
  }

  @Put(':id')
  update(@Param('id') id: string) {
    return 'This action updates an item'
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return 'This action deletes an item'
  }
  <% } %>
}
