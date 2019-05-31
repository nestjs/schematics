import { Client } from './amqp.client';
import { Observable, Subject } from 'rxjs';
import { Server } from './amqp.server';
import { ISendQueueMessageOptions, IMessage } from './interfaces';

export class Channel {
  private readonly server: Server;

  constructor(server: Server) {
    this.server = server;
  }

  public assertQueue(name: string, options: any) {
    // nothing to implement
  }

  public prefetch(...args: any[]) {
    // nothing to implement
  }

  public addSetup(handler: (channel: Channel) => void) {
    handler(this);
  }

  public close() {
    // nothing to implement
  }

  public consume(queueName: string, handler: (message: IMessage) => void, options: any) {
    const queue: Observable<any> = this.server.findOrCreateQueue(queueName);
    queue.subscribe((message: IMessage) => {
      handler(message);
    });
  }

  public sendToQueue(name: string, message: Buffer, options: ISendQueueMessageOptions) {
    const queue: Subject<IMessage> = this.server.findOrCreateQueue(name);
    queue.next({ content: message, properties: options });
  }
}
