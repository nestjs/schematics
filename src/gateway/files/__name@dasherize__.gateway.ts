import { SubscribeMessage, WebSocketGateway, WebSocketServer, WsResponse, } from '@nestjs/websockets';
import 'rxjs/add/observable/from';
import { Observable } from 'rxjs/Observable';

@WebSocketGateway()
export class <%= classify(name) %>Gateway {
  @WebSocketServer() server;

  @SubscribeMessage()
  onEvent(): Observable<WsResponse<any>> {
    return Observable.from({});
  }
}