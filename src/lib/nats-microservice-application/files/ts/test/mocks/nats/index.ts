import { NatsMockServer } from './nats.server';

export class NatsMock {
  private readonly server = new NatsMockServer();

  public connect() {
    return this.server.createConnection();
  }
}
