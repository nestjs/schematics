import { EventEmitter } from 'events';

export class Client extends EventEmitter {
  constructor(server) {
    super();
    this.server = server;
  }

  close() {
    // nothing to implement
  }

  createChannel(options) {
    return this.server.createChannel(options);
  }
}
