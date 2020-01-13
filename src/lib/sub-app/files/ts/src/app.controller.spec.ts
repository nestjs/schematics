import { Test, TestingModule } from '@nestjs/testing';
import { <%= classify(name) || 'App' %>Controller } from './app.controller';
import { <%= classify(name) || 'App' %>Service } from './app.service';

describe('AppController', () => {
  let <%= (classify(name) || 'App').toLowerCase() %>Controller: <%= classify(name) || 'App' %>Controller;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [<%= classify(name) || 'App' %>Controller],
      providers: [<%= classify(name) || 'App' %>Service],
    }).compile();

    <%= (classify(name) || 'App').toLowerCase() %>Controller = app.get<<%= classify(name) || 'App' %>Controller>(<%= classify(name) || 'App' %>Controller);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(<%= (classify(name) || 'App').toLowerCase() %>Controller.getHello()).toBe('Hello World!');
    });
  });
});
