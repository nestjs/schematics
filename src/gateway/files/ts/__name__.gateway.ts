import { SubscribeMessage, WebSocketGateway, WsResponse } from '@nestjs/websockets';
import { Observable, of } from 'rxjs/Observable';

@WebSocketGateway()
export class <%= classify(name) %>Gateway {
  @SubscribeMessage('message')
  onEvent(client: any, payload): Observable<WsResponse<any>> {
    return of({});
  }
}
