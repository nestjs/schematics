import { Catch, WsExceptionFilter } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

@Catch(WsException)
export class <%= classify(name) %>Filter implements WsExceptionFilter {
  catch(exception: WsException, client) {}
}
