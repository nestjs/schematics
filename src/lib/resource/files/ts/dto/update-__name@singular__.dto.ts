<% if (isSwaggerInstalled) { %>import { PartialType } from '@nestjs/swagger';<% } else { %>import { PartialType } from '@nestjs/mapped-types';<% } %>
import { Create<%= singular(classify(name)) %>Dto } from './create-<%= singular(name) %>.dto';

export class Update<%= singular(classify(name)) %>Dto extends PartialType(Create<%= singular(classify(name)) %>Dto) {<% if ((type === 'microservice' || type === 'ws') && crud) { %>
  id: number;
<% }%>}
