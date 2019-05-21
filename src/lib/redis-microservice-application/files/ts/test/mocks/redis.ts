import { createClient } from 'fakeredis';

export class RedisMock {
  public createClient() {
    const client = createClient(6379, 'localhost');
    setTimeout(() => client.emit('connect'), 1000);
    return client;
  }
}
