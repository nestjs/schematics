import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './../src/app.module';
import { INestMicroservice } from '@nestjs/common';
import { Transport, ClientProxy, ClientProxyFactory } from '@nestjs/microservices';
import { bootstrap } from './mocks';
import { Server } from 'mosca';

describe('MathController (e2e)', () => {
  const options: any = {
    transport: Transport.MQTT,
    options: {
      host: process.env.MQTT_HOST || 'localhost',
      port: parseInt(process.env.MQTT_PORT || '1883', 10),
    },
  };

  let mqtt: Server;
  let client: ClientProxy;
  let application: INestMicroservice;
  let module: TestingModule;

  beforeEach(async () => {
    mqtt = await bootstrap();
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
    mqtt.close();
    await client.close();
    await application.close();
    await module.close();
  });

  it('sum 1 + 2 = 3', () => {
    return client.send('sum', [1, 2]).toPromise().then((result: number) => expect(result).toBe(3));
  });
});
