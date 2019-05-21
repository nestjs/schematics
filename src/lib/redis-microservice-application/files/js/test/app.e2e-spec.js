import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './../src/app.module';
import { INestMicroservice } from '@nestjs/common';
import { Transport, ClientProxy, ClientProxyFactory } from '@nestjs/microservices';
import { RedisMock } from './mocks/redis';

const redis = new RedisMock();
jest.mock('redis', () => redis);

describe('MathController (e2e)', () => {
  const options = {
    transport: Transport.REDIS,
    options: {
      url: process.env.REDIS_URL,
    },
  }

  let client;
  let application;

  beforeEach(async () => {
    client = ClientProxyFactory.create(options);
    const module = await Test.createTestingModule({ imports: [ AppModule ] }).compile();
    application = module.createNestMicroservice(options);
    await application.listenAsync();
  });

  afterEach(async () => {
    await client.close();
    await application.close();
  });

  it('sum 1 + 2 = 3', () => {
    return client.send({ cmd: 'sum' }, [1, 2]).toPromise().then((result) => expect(result).toBe(3));
  });
});
