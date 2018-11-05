import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';

@WebSocketGateway()
export class <%= classify(name) %>Gateway {
  @SubscribeMessage('message')
  handleMessage(client, payload) {
    return 'Hello world!';
  }
}
