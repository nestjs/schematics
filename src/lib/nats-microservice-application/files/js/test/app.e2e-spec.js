import { Test } from '@nestjs/testing';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { AppModule } from './../src/app.module';
import { NatsMock } from './mocks';

jest.mock('nats', () => new NatsMock());

describe('MathController (e2e)', () => {
  const options = {
    transport: Transport.NATS,
    options: {
      url: 'nats://localhost:4222',
    },
  };

  let client;
  let application;
  let module;

  beforeEach(async () => {
    client = ClientProxyFactory.create(options);
    await client.connect();
    module = await Test.createTestingModule({
      imports: [AppModule],
    })
    .compile();
    application = module.createNestMicroservice(options);
    await application.listenAsync();
  });

  afterEach(async () => {
    await client.close();
    await application.close();
    await module.close();
  });

  it('sum 1 + 2 = 3', () => {
    return client.send('sum', [1, 2]).toPromise().then((result) => expect(result).toBe(3));
  });
});
