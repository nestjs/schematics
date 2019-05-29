import { EventEmitter } from 'events';

export class NatsMockClient extends EventEmitter {
  constructor(id, server) {
    super();
    this.id = id;
    this.server = server;
  }

  close() {
    // nothing to implement.
  }

  publish(replyTo, packet) {
    this.server.publish(replyTo, packet);
  }

  request(topicName, packet, handler) {
    return this.server.request(topicName, packet, this.id).subscribe(
      (message) => {
        handler(message);
      },
    );
  }

  subscribe(topicName, handler) {
    const topic = this.server.subscribe(topicName);
    topic.subscribe(
      (args) => {
        handler(args[0], args[1]);
      },
    );
  }

  unsubscribe(...args) {
    // nothing to implement
  }
}
