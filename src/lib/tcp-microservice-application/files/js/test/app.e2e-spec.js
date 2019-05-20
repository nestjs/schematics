import { Transport, ClientProxyFactory } from '@nestjs/microservices';
import { Test } from '@nestjs/testing';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  const client = ClientProxyFactory.create({ transport: Transport.TCP });

  let app;
  let moduleFixture;

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
    return client.send({ cmd: 'sum' }, [1, 2]).toPromise().then((result) => expect(result).toBe(3));
  });
});
