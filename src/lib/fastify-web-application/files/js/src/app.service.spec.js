import { Test } from '@nestjs/testing';
import { AppService } from './app.service';

describe('AppService', () => {
  let service;

  beforeEach(async () => {
    const app = await Test.createTestingModule({
      providers: [AppService],
    })
    .compile();

    service = app.get(AppService);
  });

  describe('root', () => {
    it('should return "Hello Fastify Web Application !"', () => {
      expect(service.getHello()).toBe('Hello Fastify Web Application !');
    });
  });
});
