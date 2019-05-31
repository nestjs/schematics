import { Client } from './amqp.client';
import { Channel } from './amqp.channel';
import { Subject } from 'rxjs';

export class Server {
  constructor() {
    this.queues = new Map();
  }

  createClient() {
    const client = new Client(this);
    setTimeout(() => client.emit('connect'));
    return client;
  }

  createChannel(options) {
    const channel = new Channel(this);
    options.setup(channel);
    return channel;
  }

  findOrCreateQueue(name) {
    let queue;
    if (this.queues.has(name)) {
      queue = this.queues.get(name);
    } else {
      queue = new Subject();
      this.queues.set(name, queue);
    }
    return queue;
  }
}
