import { WebSocketGateway<% if (crud) { %>, SubscribeMessage, MessageBody<% } %> } from '@nestjs/websockets';
import { <%= classify(name) %>Service } from './<%= name %>.service';<% if (crud) { %>
import { Create<%= singular(classify(name)) %>Dto } from './dto/create-<%= singular(name) %>.dto';
import { Update<%= singular(classify(name)) %>Dto } from './dto/update-<%= singular(name) %>.dto';<% } %>

@WebSocketGateway()
export class <%= classify(name) %>Gateway {
  constructor(private readonly <%= lowercased(name) %>Service: <%= classify(name) %>Service) {}<% if (crud) { %>

  @SubscribeMessage('create<%= singular(classify(name)) %>')
  create(@MessageBody() create<%= singular(classify(name)) %>Dto: Create<%= singular(classify(name)) %>Dto) {
    return this.<%= lowercased(name) %>Service.create(create<%= singular(classify(name)) %>Dto);
  }

  @SubscribeMessage('findAll<%= classify(name) %>')
  findAll() {
    return this.<%= lowercased(name) %>Service.findAll();
  }

  @SubscribeMessage('findOne<%= singular(classify(name)) %>')
  findOne(@MessageBody() id: number) {
    return this.<%= lowercased(name) %>Service.findOne(id);
  }

  @SubscribeMessage('update<%= singular(classify(name)) %>')
  update(@MessageBody() update<%= singular(classify(name)) %>Dto: Update<%= singular(classify(name)) %>Dto) {
    return this.<%= lowercased(name) %>Service.update(update<%= singular(classify(name)) %>Dto.id, update<%= singular(classify(name)) %>Dto);
  }

  @SubscribeMessage('remove<%= singular(classify(name)) %>')
  remove(@MessageBody() id: number) {
    return this.<%= lowercased(name) %>Service.remove(id);
  }<% } %>
}
