import { Test } from '@nestjs/testing';
import { Transport, ClientProxyFactory } from '@nestjs/microservices';
import { AppModule } from './../src/app.module';
import { AmqpConnectionManagerMock } from './mocks';

jest.mock('amqp-connection-manager', () => new AmqpConnectionManagerMock());

describe('MathController (e2e)', () => {
  const options = {
    transport: Transport.RMQ,
    options: {
      urls: [`amqp://localhost:5672`],
      queue: 'maths',
      queueOptions: { durable: false },
    },
  };

  let client;
  let fixture;
  let application;

  beforeEach(async () => {
    client = ClientProxyFactory.create(options);
    await client.connect();
    fixture = await Test.createTestingModule({
      imports: [
        AppModule,
      ],
    })
    .compile();
    application = fixture.createNestMicroservice(options);
    return await application.listenAsync();
  });

  afterEach(async () => {
    await client.close();
    await application.close();
    await fixture.close();
  });

  it('sum 1 + 2 = 3', () => {
    return client.send('sum', [1, 2]).toPromise().then((result) => expect(result).toBe(3));
  });
});
