import { Catch } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

@Catch(WsException)
export class <%= classify(name) %>Filter {
  catch(exception, client) {}
}
