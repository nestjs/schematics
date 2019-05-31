import { EventEmitter } from 'events';
import { Channel } from './amqp.channel';
import { Server } from './amqp.server';
import { ICreateChannelOptions } from './interfaces';

export class Client extends EventEmitter {
  private readonly server: Server;

  constructor(server: Server) {
    super();
    this.server = server;
  }

  public close() {
    // nothing to implement
  }

  public createChannel(options: ICreateChannelOptions): Channel {
    return this.server.createChannel(options);
  }
}
