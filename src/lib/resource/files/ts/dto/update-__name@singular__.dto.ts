<% if (dtoValidation === 'zod') { %>import { createZodDto } from '@anatine/zod-nestjs';
import { <%= camelize(name) %>Schema as create<%= classify(name) %>Schema } from './create-<%= dasherize(name) %>.dto';

const update<%= classify(name) %>Schema = create<%= classify(name) %>Schema.partial();<% } %>
<% if (isSwaggerInstalled) { %>import { PartialType } from '@nestjs/swagger';<% } else if(dtoValidation != "zod"){ %>import { PartialType } from '@nestjs/mapped-types';<% } %>
<% if (dtoValidation != "zod") { %>import { Create<%= singular(classify(name)) %>Dto } from './create-<%= singular(name) %>.dto';<% } %>
export class Update<%= singular(classify(name)) %>Dto extends<% if ((dtoValidation === 'zod')) { %> createZodDto(update<%= classify(name) %>Schema)<% } else { %>
 PartialType(Create<%= singular(classify(name)) %>Dto)<% } %>{<% if ((type === 'microservice' || type === 'ws') && crud=="yes") { %>
  id: number;
<% }%>}
