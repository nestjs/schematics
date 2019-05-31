import { Server } from './amqp.server';

export class AmqpConnectionManagerMock {
  constructor() {
    this.server = new Server();
  }

  connect(...args) {
    return this.server.createClient();
  }
}
