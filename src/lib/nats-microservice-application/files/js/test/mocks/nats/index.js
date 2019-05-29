import { NatsMockServer } from './nats.server';

export class NatsMock {
  constructor() {
    this.server = new NatsMockServer();
  }

  connect() {
    return this.server.createConnection();
  }
}
