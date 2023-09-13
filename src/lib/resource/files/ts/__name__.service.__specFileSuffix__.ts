import { TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { TransactionalTestContext } from 'typeorm-transactional-tests';
import { createTestingModule } from '@vori/nest/libs/test_helpers';
import { <%= classify(name) %>Service } from './<%= name %>.service';
import { <%= classify(singular(name)) %> } from './entities/<%= singular(name) %>.entity';

describe('<%= classify(name) %>Service', () => {
  let module: TestingModule;
  let db: DataSource;
  let transactionalContext: TransactionalTestContext;
  let service: <%= classify(name) %>Service;

  beforeEach(async () => {
    module = await createTestingModule({
      imports: [
        TypeOrmModule.forFeature([<%= classify(singular(name)) %>]),
      ],
      providers: [<%= classify(name) %>Service],
    }).compile();

    await module.init();

    db = module.get<DataSource>(DataSource);
    service = module.get<<%= classify(name) %>Service>(<%= classify(name) %>Service);
  });

  afterAll(async () => {
    await module.close();
  });

  beforeEach(async () => {
    transactionalContext = new TransactionalTestContext(db);
    await transactionalContext.start();
  });

  afterEach(async () => {
    await transactionalContext.finish();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
