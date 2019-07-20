import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './../src/app.module';
import { INestMicroservice } from '@nestjs/common';
import { Transport, ClientProxy, ClientProxyFactory } from '@nestjs/microservices';

describe('AppController (e2e)', () => {
  const client: ClientProxy = ClientProxyFactory.create({ transport: Transport.TCP });

  let app: INestMicroservice;
  let moduleFixture: TestingModule;

  beforeEach(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    })
    .compile();

    app = moduleFixture.createNestMicroservice({ transport: Transport.TCP });
    return await app.listenAsync();
  });

  afterEach(async () => {
    await client.close();
    await app.close();
    await moduleFixture.close();
  });

  it('sum 1 + 2 = 3', () => {
    return client.send({ cmd: 'sum' }, [1, 2]).toPromise().then((result: number) => expect(result).toBe(3));
  });
});
