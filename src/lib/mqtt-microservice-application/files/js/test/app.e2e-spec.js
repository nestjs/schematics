import { Test } from '@nestjs/testing';
import { AppModule } from './../src/app.module';
import { Transport, ClientProxyFactory } from '@nestjs/microservices';
import { bootstrap } from './mocks';

describe('MathController (e2e)', () => {
  const options = {
    transport: Transport.MQTT,
    options: {
      host: process.env.MQTT_HOST || 'localhost',
      port: parseInt(process.env.MQTT_PORT || '1883', 10),
    },
  };

  let mqtt;
  let client;
  let application;
  let module;

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
    return client.send('sum', [1, 2]).toPromise().then((result) => expect(result).toBe(3));
  });
});
