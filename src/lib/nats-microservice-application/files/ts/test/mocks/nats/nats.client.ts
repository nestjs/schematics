import { EventEmitter } from 'events';
import { Observable } from 'rxjs';
import { NatsMockServer } from './nats.server';

export class NatsMockClient extends EventEmitter {
  public readonly id: number;
  private readonly server: NatsMockServer;

  constructor(id: number, server: NatsMockServer) {
    super();
    this.id = id;
    this.server = server;
  }

  public close() {
    // nothing to implement.
  }

  public publish(replyTo: any, packet: any) {
    this.server.publish(replyTo, packet);
  }

  public request(topicName: string, packet: any, handler: (message: any) => void) {
    return this.server.request(topicName, packet, this.id).subscribe(
      (message: any) => {
        handler(message);
      },
    );
  }

  public subscribe(topicName: string, handler: (buffer: any, replyTo: any) => void) {
    const topic: Observable<any> = this.server.subscribe(topicName);
    topic.subscribe(
      (args: any[]) => {
        handler(args[0], args[1]);
      },
    );
  }

  public unsubscribe(...args: any[]) {
    // nothing to implement
  }
}
