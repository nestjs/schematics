import { Client } from './amqp.client';
import { Server } from './amqp.server';

export class AmqpConnectionManagerMock {
  private readonly server: Server;

  constructor() {
    this.server = new Server();
  }

  public connect(...args: any[]): Client {
    return this.server.createClient();
  }
}
