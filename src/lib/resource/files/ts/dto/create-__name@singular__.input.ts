<% if (type === 'graphql-code-first') { %>import { InputType } from '@nestjs/graphql';

@InputType()
export class Create<%= singular(classify(name)) %>Input {}<% } else { %>export class Create<%= singular(classify(name)) %>Input {}<% } %>