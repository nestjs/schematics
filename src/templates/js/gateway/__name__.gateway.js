import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { of } from 'rxjs';

@WebSocketGateway()
export class <%= classify(name) %>Gateway {
  @SubscribeMessage('message')
  onEvent(client, payload) {
    return of({});
  }
}
