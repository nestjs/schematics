export class Channel {
  constructor(server) {
    this.server = server;
  }

  assertQueue(name, options) {
    // nothing to implement
  }

  prefetch(...args) {
    // nothing to implement
  }

  addSetup(handler) {
    handler(this);
  }

  close() {
    // nothing to implement
  }

  consume(queueName, handler, options) {
    const queue = this.server.findOrCreateQueue(queueName);
    queue.subscribe((message) => {
      handler(message);
    });
  }

  sendToQueue(name, message, options) {
    const queue = this.server.findOrCreateQueue(name);
    queue.next({ content: message, properties: options });
  }
}
