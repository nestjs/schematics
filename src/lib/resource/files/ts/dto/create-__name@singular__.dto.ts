<% if (enumImports.length) { %>import { <%= enumImports.join(', ') %> } from '@prisma/client';<% } %>
<% if (dtoValidation === 'zod') { %>import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';<% } %>
<% if (dtoValidation === 'class-validator' && classValidatorImports.length) { %>
import { <%= classValidatorImports.join(', ') %> } from 'class-validator';
export class Create<%= singular(classify(name)) %>Dto {<% prismaFields.forEach(field => { %>
  <% if (field.isEmail) { %>
  @IsEmail()<% } else if (field.type === 'string') { %>
  @IsString()<% } else if (field.type === 'number') { %>
  @IsNumber()<% } else if (field.type === 'boolean') { %>
  @IsBoolean()<% } else if (field.type === 'Date') { %>
  @IsDate()<% } else if (field.isEnum) { %>
  @IsEnum(<%= field.type %>)<% } %><% if (field.isArray) { %>
  @IsArray()<% } %><% if (field.isOptional) { %>
  @IsOptional()<% } else { %>
  @IsNotEmpty()<% } %>
  readonly <%= field.name %><% if (field.isOptional) { %>?<% } %>: <%= field.type %><% if (field.isArray) { %>[]<% } %>;<% }); %>
}<% } else if (dtoValidation === 'zod') { %> 
<% enumImports.forEach(enumName => { %>export const <%= camelize(enumName) %>Schema = z.nativeEnum(<%= enumName %>); 
<% }); %>
export const <%= camelize(name) %>Schema = z.strictObject({
<% prismaFields.forEach(field => { %><% if (field.isEnum) { %>  <%= field.name %>: <%= field.isArray ? 'z.array(' + camelize(field.type) + 'Schema)' :  camelize(field.type)+ 'Schema' %><% if (field.isOptional) { %>.optional()<% } %>,<% } else { %>  <%= field.name %>: z.<%= field.isArray ? 'array(z.' + field.type.toLowerCase() + '())' : field.type.toLowerCase() + '()' %><% if (field.isOptional) { %>.optional()<% } %>,<% } %>
<% }); %>});
export class Create<%= singular(classify(name)) %>Dto extends createZodDto(<%= camelize(name) %>Schema) {}
<% } else if (dtoValidation === 'no') { %>
export class Create<%= singular(classify(name)) %>Dto {
<% prismaFields.forEach(field => { %>
  readonly <%= field.name %>: <%= field.type %><% if (field.isArray) { %>[]<% } %>;
<% }); %>
}
<% } %>