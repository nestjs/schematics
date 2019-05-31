import { Client } from './amqp.client';
import { Channel } from './amqp.channel';
import { ICreateChannelOptions } from './interfaces';
import { Subject } from 'rxjs';

export class Server {
  private readonly queues: Map<string, Subject<any>>;

  constructor() {
    this.queues = new Map();
  }

  public createClient(): Client {
    const client = new Client(this);
    setTimeout(() => client.emit('connect'));
    return client;
  }

  public createChannel(options: ICreateChannelOptions): Channel {
    const channel = new Channel(this);
    options.setup(channel);
    return channel;
  }

  public findOrCreateQueue(name: string): Subject<any> {
    let queue: Subject<any>;
    if (this.queues.has(name)) {
      queue = this.queues.get(name);
    } else {
      queue = new Subject();
      this.queues.set(name, queue);
    }
    return queue;
  }
}
