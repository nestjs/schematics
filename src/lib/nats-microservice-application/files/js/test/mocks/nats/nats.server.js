import { NatsMockClient } from './nats.client';
import { Subject, Observable } from 'rxjs';

export class NatsMockServer {
  constructor() {
    this.clients = [];
    this.topics = new Map();
  }

  createConnection() {
    const id = this.clients.length;
    const client = new NatsMockClient(id, this);
    this.clients.push(new Subject());
    setTimeout(() => client.emit('connect'), 1000);
    return client;
  }

  publish(replyTo, message) {
    const client = this.clients[replyTo];
    client.next(message);
  }

  request(topicName, message, replyTo) {
    const topic = this.topics.get(topicName);
    topic.next([message, replyTo]);
    return this.clients[replyTo];
  }

  subscribe(topicName) {
    let topic;
    if (this.topics.has(topicName)) {
      topic = this.topics.get(topicName);
    } else {
      topic = new Subject();
      this.topics.set(topicName, topic);
    }
    return topic;
  }
}
