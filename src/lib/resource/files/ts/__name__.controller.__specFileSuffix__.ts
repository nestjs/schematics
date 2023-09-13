import { TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { createTestingModule } from '@vori/nest/libs/test_helpers';
import { <%= classify(name) %>Controller } from './<%= name %>.controller';
import { <%= classify(name) %>Service } from './<%= name %>.service';
import { <%= classify(singular(name)) %> } from './entities/<%= singular(name) %>.entity';

describe('<%= classify(name) %>Controller', () => {
  let controller: <%= classify(name) %>Controller;

  beforeEach(async () => {
    const module: TestingModule = await createTestingModule({
      imports: [
        TypeOrmModule.forFeature([<%= classify(singular(name)) %>]),
      ],
      controllers: [<%= classify(name) %>Controller],
      providers: [<%= classify(name) %>Service],
    }).compile();

    controller = module.get<<%= classify(name) %>Controller>(<%= classify(name) %>Controller);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
