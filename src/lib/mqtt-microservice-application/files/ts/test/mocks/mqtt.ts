import { Server, persistence } from 'mosca';

export async function bootstrap() {
  return new Promise<Server>((resolve) => {
    const settings = {
      port: 1883,
      id: 'test',
      backend: {
        type: 'zmq',
        json: false,
        zmq: require('zmq'),
        port: 'tcp://127.0.0.1:33333',
        controlPort: 'tcp://127.0.0.1:33334',
        delay: 10,
      },
      persistance: {
        factory: persistence.Memory,
      },
    };
    const server = new Server(settings);
    server.on('ready', () => {
      resolve(server);
    });
  });
}
