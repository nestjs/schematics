import { Test, TestingModule } from '@nestjs/testing';
import { <%= classify(name) %>Controller } from './<%= name %>.controller';
import { <%= classify(name) %>Service } from './<%= name %>.service';

describe('<%= classify(name) %>Controller', () => {
  let <%= camelize(name) %>Controller: <%= classify(name) %>Controller;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [<%= classify(name) %>Controller],
      providers: [<%= classify(name) %>Service],
    }).compile();

    <%= camelize(name) %>Controller = app.get<<%= classify(name) %>Controller>(<%= classify(name) %>Controller);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(<%= camelize(name) %>Controller.getHello()).toBe('Hello World!');
    });
  });
});
