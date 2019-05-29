import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './../src/app.module';
import { INestMicroservice } from '@nestjs/common';
import { Transport, ClientProxy, ClientProxyFactory } from '@nestjs/microservices';
import { NatsMock } from './mocks';

jest.mock('nats', () => new NatsMock());

describe('MathController (e2e)', () => {
  const options: any = {
    transport: Transport.NATS,
    options: {
      url: 'nats://localhost:4222',
    },
  };

  let client: ClientProxy;
  let application: INestMicroservice;
  let module: TestingModule;

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
    return client.send('sum', [1, 2]).toPromise().then((result: number) => expect(result).toBe(3));
  });
});
