import { IsString, IsInt, IsBoolean, IsDate, IsNumber, IsOptional } from 'class-validator';

export class Create<%= singular(classify(name)) %>Dto {
<% prismaFields.forEach(field => { %>
  <% if (field.type === 'String') { %>
  @IsString()
  <% if (field.isEmail) { %>@IsEmail()<% } %>
  <% } else if (field.type === 'Int') { %>
  @IsInt()
  <% } else if (field.type === 'Float') { %>
  @IsNumber()
  <% } else if (field.type === 'Boolean') { %>
  @IsBoolean()
  <% } else if (field.type === 'DateTime') { %>
  @IsDate()
  <% } %>
  <% if (field.isOptional) { %>@IsOptional()<% } %>
  readonly <%= field.name %>: <%= field.type %>;
<% }); %>
}


