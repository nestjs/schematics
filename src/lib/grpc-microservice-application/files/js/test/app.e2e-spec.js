import { Test } from '@nestjs/testing';
import { Transport } from '@nestjs/microservices';
import { join } from 'path';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { ClientModule } from './client';

describe('HeroController (e2e)', () => {
  const options = {
    transport: Transport.GRPC,
    options: {
      package: 'hero',
      protoPath: join(process.cwd(), 'proto/hero.proto'),
    },
  };

  let client;
  let server;

  beforeEach(async () => {
    const clientFixture = await Test.createTestingModule({ imports: [ClientModule] }).compile();
    client = clientFixture.createNestApplication();
    client.connectMicroservice(options);
    await client.listenAsync(3000);

    const serverFixture = await Test.createTestingModule({ imports: [AppModule] }).compile();
    server = serverFixture.createNestMicroservice(options);
    await server.listenAsync();
  });

  afterEach(async () => {
    await client.close();
    await server.close();
  });

  it('return John', () => {
    return request(client.getHttpServer())
      .get('/heroes/1')
      .expect(200)
      .expect({ id: 1, name: 'John' });
  });
});
