import { SubscribeMessage, WebSocketGateway, WebSocketServer, } from '@nestjs/websockets';
import 'rxjs/add/observable/from';
import { Observable } from 'rxjs/Observable';

@WebSocketGateway()
export class <%= classify(name) %>Gateway {
  @WebSocketServer() server;

  @SubscribeMessage()
  onEvent() {
    return Observable.from({});
  }
}
