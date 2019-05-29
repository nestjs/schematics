import { NatsMockClient } from './nats.client';
import { Subject, Observable } from 'rxjs';

export class NatsMockServer {
  private readonly clients: Array<Subject<any>> = [];
  private readonly topics: Map<string, Subject<any>> = new Map();

  public createConnection(): NatsMockClient {
    const id: number = this.clients.length;
    const client = new NatsMockClient(id, this);
    this.clients.push(new Subject());
    setTimeout(() => client.emit('connect'), 1000);
    return client;
  }

  public publish(replyTo: string, message: any) {
    const client: Subject<any> = this.clients[replyTo];
    client.next(message);
  }

  public request(topicName: string, message: any, replyTo: any): Observable<any> {
    const topic: Subject<any> = this.topics.get(topicName);
    topic.next([message, replyTo]);
    return this.clients[replyTo];
  }

  public subscribe(topicName: string): Observable<any> {
    let topic: Subject<any>;
    if (this.topics.has(topicName)) {
      topic = this.topics.get(topicName);
    } else {
      topic = new Subject<any>();
      this.topics.set(topicName, topic);
    }
    return topic;
  }
}
