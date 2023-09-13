import {
  SchematicTestRunner,
  UnitTestTree,
} from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { ResourceOptions } from './resource.schema';

describe('Resource Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner(
    '.',
    path.join(process.cwd(), 'src/collection.json'),
  );

  describe('[REST API]', () => {
    it('should generate appropriate files ', async () => {
      const options: ResourceOptions = {
        name: 'users',
      };
      const tree = await runner
        .runSchematicAsync('resource', options)
        .toPromise();
      const files = tree.files;
      expect(files).toEqual([
        '/users/users.controller.spec.ts',
        '/users/users.controller.ts',
        '/users/users.e2e.spec.ts',
        '/users/users.module.ts',
        '/users/users.service.spec.ts',
        '/users/users.service.ts',
        '/users/dto/user.dto.spec.ts',
        '/users/dto/user.dto.ts',
        '/users/entities/user.entity.ts',
        '/users/fakers/user.faker.ts',
      ]);
    });
    it("should keep underscores in resource's path and file name", async () => {
      const options: ResourceOptions = {
        name: '_users',
      };
      const tree = await runner
        .runSchematicAsync('resource', options)
        .toPromise();
      const files = tree.files;
      expect(files).toEqual([
        '/_users/_users.controller.spec.ts',
        '/_users/_users.controller.ts',
        '/_users/_users.e2e.spec.ts',
        '/_users/_users.module.ts',
        '/_users/_users.service.spec.ts',
        '/_users/_users.service.ts',
        '/_users/dto/_user.dto.spec.ts',
        '/_users/dto/_user.dto.ts',
        '/_users/entities/_user.entity.ts',
        '/_users/fakers/_user.faker.ts',
      ]);
    });
    describe('when "crud" option is not enabled', () => {
      it('should generate appropriate files (without dtos)', async () => {
        const options: ResourceOptions = {
          name: 'users',
          crud: false,
        };
        const tree = await runner
          .runSchematicAsync('resource', options)
          .toPromise();
        const files = tree.files;
        expect(files).toEqual([
          '/users/users.controller.spec.ts',
          '/users/users.controller.ts',
          '/users/users.module.ts',
          '/users/users.service.spec.ts',
          '/users/users.service.ts',
          '/users/fakers/user.faker.ts',
        ]);
      });
    });
    describe('when "spec" option is not enabled', () => {
      it('should generate appropriate files (without dtos)', async () => {
        const options: ResourceOptions = {
          name: 'users',
          spec: false,
          crud: false,
        };
        const tree = await runner
          .runSchematicAsync('resource', options)
          .toPromise();
        const files = tree.files;
        expect(files).toEqual([
          '/users/users.controller.ts',
          '/users/users.module.ts',
          '/users/users.service.ts',
          '/users/fakers/user.faker.ts',
        ]);
      });
    });
  });

  describe('[REST API]', () => {
    const options: ResourceOptions = {
      name: 'users',
      isSwaggerInstalled: true,
    };

    let tree: UnitTestTree;

    beforeAll(async () => {
      tree = await runner.runSchematicAsync('resource', options).toPromise();
    });

    it('should generate "UsersController" class', () => {
      expect(tree.readContent('/users/users.controller.ts'))
        .toEqual(`import { Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { RequestWithBannerUser } from '@vori/nest/libs/auth/types';
import { ApiEndpoint } from '@vori/nest/libs/decorators';
import { FindOneParams } from '@vori/nest/params/FindOneParams';
import { UsersService } from './users.service';
import { UserDto, CreateUserDto, UpdateUserDto } from './dto/user.dto';

// TODO Add tags to group endpoints in Swagger UI
@ApiEndpoint({ prefix: 'users', tags: [] })
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ operationId: 'createUser %>' })
  @ApiCreatedResponse({ type: UserDto })
  @ApiBadRequestResponse()
  @Post()
  public async create(
    @Req() request: RequestWithBannerUser,
    @Body() createUserDto: CreateUserDto
  ): Promise<UserDto> {
    const user = await this.usersService.create(request.user, createUserDto);
    return UserDto.from(user);
  }

  @ApiOperation({ operationId: 'listUser' })
  @ApiOkResponse({ type: UserDto, isArray: true })
  @Get()
  public async findAll(@Req() request: RequestWithBannerUser): Promise<UserDto[]> {
    const users = await this.usersService.findAll(request.user);
    return users.map(UserDto.from);
  }

  @ApiOperation({ operationId: 'getUser' })
  @ApiNotFoundResponse()
  @ApiOkResponse({ type: UserDto })
  @Get(':id')
  public async findOne(@Req() request: RequestWithBannerUser, @Param() params: FindOneParams) {
    const user = await this.usersService.findOne(request.user, params.id);
    return UserDto.from(user);
  }

  @ApiOperation({ operationId: 'updateUser' })
  @ApiBadRequestResponse()
  @ApiNotFoundResponse()
  @ApiOkResponse({ type: UserDto })
  @Patch(':id')
  public async update(@Req() request: RequestWithBannerUser, @Param() params: FindOneParams, @Body() updateUserDto: UpdateUserDto) {
    const user = await this.usersService.update(request.user, params.id, updateUserDto);
    return UserDto.from(user);
  }

  @ApiOperation({ operationId: 'deleteUser' })
  @ApiNotFoundResponse()
  @ApiNoContentResponse()
  @Delete(':id')
  public async remove(@Req() request: RequestWithBannerUser, @Param() params: FindOneParams): Promise<void> {
    await this.usersService.remove(request.user, params.id);
  }
}
`);
    });

    it('should generate "UsersService" class', () => {
      expect(tree.readContent('/users/users.service.ts'))
        .toEqual(`import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BannerMember } from '@vori/types/User';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>
  ) {}

  public async create(user: BannerMember, createUserDto: CreateUserDto): Promise<User> {
    return 'This action adds a new user';
  }

  public async findAll(user: BannerMember): Promise<User[]> {
    return \`This action returns all users\`;
  }

  public async findOne(user: BannerMember, id: string): Promise<User> {
    return \`This action returns a #\${id} user\`;
  }

  public async update(user: BannerMember, id: string, updateUserDto: UpdateUserDto): Promise<User> {
    return \`This action updates a #\${id} user\`;
  }

  public async remove(user: BannerMember, id: string): Promise<void> {
    return \`This action removes a #\${id} user\`;
  }
}
`);
    });

    it('should generate "UsersModule" class', () => {
      expect(tree.readContent('/users/users.module.ts'))
        .toEqual(`import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
`);
    });

    it('should generate "User" class', () => {
      expect(tree.readContent('/users/entities/user.entity.ts'))
        .toEqual(`import { Entity } from 'typeorm';
import { BaseEntity } from '@vori/types/BaseEntity';

// TODO Remember to add your new entity to getDataBaseEntities.
@Entity('users')
export class User extends BaseEntity {}
`);
    });

    it('should generate "CreateUserDto" and "UpdateUserDto" classes', () => {
      expect(tree.readContent('/users/dto/user.dto.ts')).toEqual(
        `import { PartialType } from '@nestjs/swagger';
import { BaseEntityDto } from '@vori/nest/libs/dto';
import { User } from '../entities/user.entity';

export class UserDto extends BaseEntityDto {
  public static from(user: User): UserDto {
    return {
      ...BaseEntityDto.from(user),
    };
  }
}

export class CreateUserDto {}

export class UpdateUserDto extends PartialType(CreateUserDto) {}
`,
      );
    });

    it('should generate "UserDto" spec file', () => {
      expect(tree.readContent('/users/dto/user.dto.spec.ts')).toEqual(
        `import { faker } from '@faker-js/faker';

import { getDataSource } from '@vori/providers/database';

import { makeUser } from '../fakers/user.faker';
import { UserDto } from './user.dto'; }

describe('UserDto', () => {
  beforeAll(async () => {
    await getDataSource();
  });

  describe('from', () => {
    it('converts an entity to a DTO', () => {
      const user = makeUser({
        id: faker.datatype.number({ min: 1 }).toString(),
      });
      const dto = UserDto.from(user);

      expect(dto).toMatchObject({
        id: user.id,
        created_at: user.createdAt.toISOString(),
        updated_at: user.updatedAt.toISOString(),
      });
    });
  });
});
`,
      );
    });

    it('should generate "Users" e2e spec file', () => {
      expect(tree.readContent('/users/users.e2e.spec.ts')).toEqual(
        `import { faker } from '@faker-js/faker';
import { INestApplication, Injectable } from '@nestjs/common';
import { instanceToPlain } from 'class-transformer';
import { orderBy, times } from 'lodash';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { TransactionalTestContext } from 'typeorm-transactional-tests';

import { Banner } from '@vori/types/Banner';
import { APIBannerUser } from '@vori/types/User';

import { makeAndSaveBanner } from '@vori/utils/VoriRandom/Banner.random';

import { configureApp } from '@vori/nest/bootstrap';
import { FirebaseAuthStrategy } from '@vori/nest/libs/auth/firebase-auth.strategy';
import {
  createAnnotatedUser,
  createE2ETestingModule,
  mockTemporalSetupAndShutdown,
} from '@vori/nest/libs/test_helpers';

// TODO Adjust depending on which service primarily uses the newly-created module.
import { AppModule } from '../../../../services/graphql-api/src/app.module';
import {
  CreateUserDto,
  UserDto,
} from './dto/user.dto';
import { User } from './entities/user.entity';
import { makeUser, makeAndSaveUser } from './fakers/user.faker';
import { UsersService } from './users.service';

describe('/v1/users', () => {
  let app: INestApplication;
  let db: DataSource;
  let transactionalContext: TransactionalTestContext;
  let banner: Banner;
  let user: APIBannerUser | undefined;
  let usersService: UsersService;

  @Injectable()
  class MockFirebaseAuthStrategy extends FirebaseAuthStrategy {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    async validate(token): Promise<APIBannerUser | undefined> {
      return user;
    }
  }

  beforeAll(async () => {
    mockTemporalSetupAndShutdown();

    const moduleRef = await createE2ETestingModule({
      // TODO Remember to import UsersModule into AppModule
      imports: [AppModule],
    })
      .overrideProvider(FirebaseAuthStrategy)
      .useClass(MockFirebaseAuthStrategy)
      .compile();

    app = moduleRef.createNestApplication();
    app = configureApp(app);
    await app.init();

    db = app.get<DataSource>(DataSource);
    usersService = app.get<UsersService>(
      UsersService
    );
  });

  beforeEach(async () => {
    transactionalContext = new TransactionalTestContext(db);
    await transactionalContext.start();

    banner = await makeAndSaveBanner(db);
    user = <APIBannerUser>await createAnnotatedUser({ db, banner });
  });

  afterEach(async () => {
    await transactionalContext.finish();
  });

  describe('POST /v1/users', () => {
    it('requires authorization', async () => {
      user = undefined;
      await request(app.getHttpServer())
        .post('/v1/users')
        .set('Authorization', 'Bearer FAKE')
        .expect(401);
    });

    it('creates a new User', async () => {
      // TODO Add fields
      const body: CreateUserDto = {};

      const response = await request(app.getHttpServer())
        .post('/v1/users')
        .set('Authorization', 'Bearer FAKE')
        .send(instanceToPlain(body))
        .expect(201);

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const user = await usersService.findOne(
        user!,
        response.body.id
      );
      // TODO Assert values stored in database

      expect(response.body).toEqual(
        instanceToPlain(UserDto.from(user))
      );
    });
  });

  describe('GET /v1/users', () => {
    // TODO Modify if the entity is not attached to a banner
    it('returns all Users for the authenticated banner', async () => {
      // No data exists, so nothing returned
      let response = await request(app.getHttpServer())
        .get('/v1/users')
        .set('Authorization', 'Bearer FAKE')
        .expect(200);
      expect(response.body).toEqual([]);

      // Data belonging to other banners should never be returned
      const otherBanner = await makeAndSaveBanner(db);
      await makeAndSaveUser(db, { banner: otherBanner });
      response = await request(app.getHttpServer())
        .get('/v1/users')
        .set('Authorization', 'Bearer FAKE')
        .expect(200);
      expect(response.body).toEqual([]);

      // Response should include data belonging to this banner
      const users = await Promise.all(
        times(3, async () => makeAndSaveUser(db, { banner }))
      );
      response = await request(app.getHttpServer())
        .get('/v1/users')
        .set('Authorization', 'Bearer FAKE')
        .expect(200);
      expect(response.body).toEqual(
        orderBy(users, 'createdAt', 'desc').map(
          UserDto.from
        )
      );
    });
  });

  describe('GET /v1/users/:id', () => {
    // TODO Update if data is not associated with a banner
    it('does NOT return data belonging to other banners', async () => {
      const otherBanner = await makeAndSaveBanner(db);
      const otherUser = await makeAndSaveUser(
        db,
        { banner: otherBanner }
      );

      await request(app.getHttpServer())
        .get(\`/v1/users/$\{otherUser.id}\`)
        .set('Authorization', 'Bearer FAKE')
        .expect(404);
    });

    it('returns the User', async () => {
      const user = await makeAndSaveUser(db, {
        banner,
      });

      const response = await request(app.getHttpServer())
        .get(\`/v1/users/$\{user.id}\`)
        .set('Authorization', 'Bearer FAKE')
        .expect(200);

      expect(response.body).toEqual(
        instanceToPlain(UserDto.from(user))
      );
    });
  });

  describe('PATCH /v1/users/:id', () => {
    // TODO Update if data is not associated with a banner
    it('does NOT permit modifying data belonging to other banners', async () => {
      const otherBanner = await makeAndSaveBanner(db);
      const otherUser = await makeAndSaveUser(
        db,
        { banner: otherBanner }
      );

      await request(app.getHttpServer())
        .patch(\`/v1/users/$\{otherUser.id}\`)
        .set('Authorization', 'Bearer FAKE')
        .send({
          // TODO Add a body
        })
        .expect(404);

      const reloadedUser = await db
        .getRepository(User)
        .findOneOrFail({ where: { id: otherUser.id } });
      expect(reloadedUser.updatedAt).toEqual(
        otherUser.updatedAt
      );
      // TODO Assert fields are unchanged
    });

    it('updates the User', async () => {
      const user = await makeAndSaveUser(db, {
        banner,
      });

      // TODO Add a body
      const body = {};
      const response = await request(app.getHttpServer())
        .patch(\`/v1/users/$\{user.id}\`)
        .set('Authorization', 'Bearer FAKE')
        .send(body)
        .expect(200);

      const reloadedUser = await db
        .getRepository(User)
        .findOneOrFail({ where: { id: user.id } });

      // TODO Assert database fields updated

      expect(response.body).toEqual(
        instanceToPlain(
          UserDto.from(reloadedUser)
        )
      );
    });
  });

  describe('DELETE /v1/users/:id', () => {
    // TODO Update if data is not associated with a banner
    it('does NOT permit modifying data belonging to other banners', async () => {
      const otherBanner = await makeAndSaveBanner(db);
      const otherUser = await makeAndSaveUser(
        db,
        { banner: otherBanner }
      );

      await request(app.getHttpServer())
        .delete(\`/v1/users/$\{otherUser.id}\`)
        .set('Authorization', 'Bearer FAKE')
        .expect(404);

      await db
        .getRepository(User)
        .findOneOrFail({ where: { id: otherUser.id } });
    });

    it('deletes the User', async () => {
      const user = await makeAndSaveUser(db, {
        banner,
      });

      await request(app.getHttpServer())
        .delete(\`/v1/users/$\{user.id}\`)
        .set('Authorization', 'Bearer FAKE')
        .expect(200);

      expect(
        await db
          .getRepository(User)
          .exist({ where: { id: user.id } })
      ).toEqual(false);
    });
  });
});
`,
      );
    });

    it('should generate "UsersController" spec file', () => {
      expect(tree.readContent('/users/users.controller.spec.ts'))
        .toEqual(`import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [UsersService],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
`);
    });

    it('should generate "UsersService" spec file', () => {
      expect(tree.readContent('/users/users.service.spec.ts'))
        .toEqual(`import { TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { TransactionalTestContext } from 'typeorm-transactional-tests';
import { createTestingModule } from '@vori/nest/libs/test_helpers';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

describe('UsersService', () => {
  let module: TestingModule;
  let db: DataSource;
  let transactionalContext: TransactionalTestContext;
  let service: UsersService;

  beforeEach(async () => {
    module = await createTestingModule({
      imports: [
        TypeOrmModule.forFeature([User]),
      ],
      providers: [UsersService],
    }).compile();

    await module.init();

    db = module.get<DataSource>(DataSource);
    service = module.get<UsersService>(UsersService);
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
`);
    });

    it('should generate "User" faker file', () => {
      expect(tree.readContent('/users/fakers/user.faker.ts'))
        .toEqual(`import { faker } from '@faker-js/faker';
import { merge } from 'lodash';
import { DataSource } from 'typeorm';

import { getRepository } from '@vori/providers/database';

import { User } from '../entities/user.entity';

export function makeUser(
  overrides: Partial<User> = {}
): User {
  return getRepository(User).create(
    merge(
      {
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      overrides
    )
  );
}

export function makeAndSaveUser(
  dataSource: DataSource,
  overrides: Partial<User> = {}
): Promise<User> {
  // TODO Add constraints, if necessary
  // const bannerID = overrides.bannerID || overrides.banner?.id;
  //
  // if (!bannerID) {
  //   throw new TypeError('banner or bannerID must be supplied!');
  // }

  return dataSource
    .getRepository(User)
    .save(makeUser(overrides));
}
`);
    });
  });

  describe('[REST API - with "crud" disabled]', () => {
    const options: ResourceOptions = {
      name: 'users',
      crud: false,
      spec: false,
    };

    let tree: UnitTestTree;

    beforeAll(async () => {
      tree = await runner.runSchematicAsync('resource', options).toPromise();
    });

    it('should generate "UsersController" class', () => {
      expect(tree.readContent('/users/users.controller.ts'))
        .toEqual(`import { Controller } from '@nestjs/common';
import { UsersService } from './users.service';

// TODO Add tags to group endpoints in Swagger UI
@ApiEndpoint({ prefix: 'users', tags: [] })
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
}
`);
    });

    it('should generate "UsersService" class', () => {
      expect(tree.readContent('/users/users.service.ts'))
        .toEqual(`import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BannerMember } from '@vori/types/User';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>
  ) {}
}
`);
    });

    it('should generate "UsersModule" class', () => {
      expect(tree.readContent('/users/users.module.ts'))
        .toEqual(`import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
`);
    });

    it('should not generate "User" class', () => {
      expect(tree.readContent('/users/entities/user.entity.ts')).toEqual('');
    });

    it('should not generate "CreateUserDto" class', () => {
      expect(tree.readContent('/users/dto/create-user.dto.ts')).toEqual('');
    });

    it('should not generate "UpdateUserDto" class', () => {
      expect(tree.readContent('/users/dto/update-user.dto.ts')).toEqual('');
    });
  });

  describe('[Microservice]', () => {
    it('should generate appropriate files ', async () => {
      const options: ResourceOptions = {
        name: 'users',
        type: 'microservice',
      };
      const tree = await runner
        .runSchematicAsync('resource', options)
        .toPromise();
      const files = tree.files;
      expect(files).toEqual([
        '/users/users.controller.spec.ts',
        '/users/users.controller.ts',
        '/users/users.module.ts',
        '/users/users.service.spec.ts',
        '/users/users.service.ts',
        '/users/dto/user.dto.spec.ts',
        '/users/dto/user.dto.ts',
        '/users/entities/user.entity.ts',
        '/users/fakers/user.faker.ts',
      ]);
    });
    describe('when "crud" option is not enabled', () => {
      it('should generate appropriate files (without dtos)', async () => {
        const options: ResourceOptions = {
          name: 'users',
          crud: false,
          type: 'microservice',
        };
        const tree = await runner
          .runSchematicAsync('resource', options)
          .toPromise();
        const files = tree.files;
        expect(files).toEqual([
          '/users/users.controller.spec.ts',
          '/users/users.controller.ts',
          '/users/users.module.ts',
          '/users/users.service.spec.ts',
          '/users/users.service.ts',
          '/users/fakers/user.faker.ts',
        ]);
      });
    });
    describe('when "spec" option is not enabled', () => {
      it('should generate appropriate files (without dtos)', async () => {
        const options: ResourceOptions = {
          name: 'users',
          spec: false,
          crud: false,
          type: 'microservice',
        };
        const tree = await runner
          .runSchematicAsync('resource', options)
          .toPromise();
        const files = tree.files;
        expect(files).toEqual([
          '/users/users.controller.ts',
          '/users/users.module.ts',
          '/users/users.service.ts',
          '/users/fakers/user.faker.ts',
        ]);
      });
    });
  });

  describe('[Microservice]', () => {
    const options: ResourceOptions = {
      name: 'users',
      type: 'microservice',
    };

    let tree: UnitTestTree;

    beforeAll(async () => {
      tree = await runner.runSchematicAsync('resource', options).toPromise();
    });

    it('should generate "UsersController" class', () => {
      expect(tree.readContent('/users/users.controller.ts'))
        .toEqual(`import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UsersService } from './users.service';
import { UserDto, CreateUserDto, UpdateUserDto } from './dto/user.dto';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @MessagePattern('createUser')
  create(@Payload() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @MessagePattern('findAllUsers')
  findAll() {
    return this.usersService.findAll();
  }

  @MessagePattern('findOneUser')
  findOne(@Payload() id: number) {
    return this.usersService.findOne(id);
  }

  @MessagePattern('updateUser')
  update(@Payload() updateUserDto: UpdateUserDto) {
    return this.usersService.update(updateUserDto.id, updateUserDto);
  }

  @MessagePattern('removeUser')
  remove(@Payload() id: number) {
    return this.usersService.remove(id);
  }
}
`);
    });

    it('should generate "UsersService" class', () => {
      expect(tree.readContent('/users/users.service.ts'))
        .toEqual(`import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BannerMember } from '@vori/types/User';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>
  ) {}

  public async create(user: BannerMember, createUserDto: CreateUserDto): Promise<User> {
    return 'This action adds a new user';
  }

  public async findAll(user: BannerMember): Promise<User[]> {
    return \`This action returns all users\`;
  }

  public async findOne(user: BannerMember, id: string): Promise<User> {
    return \`This action returns a #\${id} user\`;
  }

  public async update(user: BannerMember, id: string, updateUserDto: UpdateUserDto): Promise<User> {
    return \`This action updates a #\${id} user\`;
  }

  public async remove(user: BannerMember, id: string): Promise<void> {
    return \`This action removes a #\${id} user\`;
  }
}
`);
    });

    it('should generate "UsersModule" class', () => {
      expect(tree.readContent('/users/users.module.ts'))
        .toEqual(`import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
`);
    });

    it('should generate "User" class', () => {
      expect(tree.readContent('/users/entities/user.entity.ts'))
        .toEqual(`import { Entity } from 'typeorm';
import { BaseEntity } from '@vori/types/BaseEntity';

// TODO Remember to add your new entity to getDataBaseEntities.
@Entity('users')
export class User extends BaseEntity {}
`);
    });

    it('should generate "CreateUserDto" and "UpdateUserDto" classes', () => {
      expect(tree.readContent('/users/dto/user.dto.ts')).toEqual(
        `import { PartialType } from '@nestjs/mapped-types';
import { BaseEntityDto } from '@vori/nest/libs/dto';
import { User } from '../entities/user.entity';

export class UserDto extends BaseEntityDto {
  public static from(user: User): UserDto {
    return {
      ...BaseEntityDto.from(user),
    };
  }
}

export class CreateUserDto {}

export class UpdateUserDto extends PartialType(CreateUserDto) {}
`,
      );
    });

    it('should generate "UsersController" spec file', () => {
      expect(tree.readContent('/users/users.controller.spec.ts'))
        .toEqual(`import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [UsersService],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
`);
    });

    it('should generate "UsersService" spec file', () => {
      expect(tree.readContent('/users/users.service.spec.ts'))
        .toEqual(`import { TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { TransactionalTestContext } from 'typeorm-transactional-tests';
import { createTestingModule } from '@vori/nest/libs/test_helpers';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

describe('UsersService', () => {
  let module: TestingModule;
  let db: DataSource;
  let transactionalContext: TransactionalTestContext;
  let service: UsersService;

  beforeEach(async () => {
    module = await createTestingModule({
      imports: [
        TypeOrmModule.forFeature([User]),
      ],
      providers: [UsersService],
    }).compile();

    await module.init();

    db = module.get<DataSource>(DataSource);
    service = module.get<UsersService>(UsersService);
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
`);
    });
  });

  describe('[Microservice - with "crud" disabled]', () => {
    const options: ResourceOptions = {
      name: 'users',
      type: 'microservice',
      crud: false,
      spec: false,
    };

    let tree: UnitTestTree;

    beforeAll(async () => {
      tree = await runner.runSchematicAsync('resource', options).toPromise();
    });

    it('should generate "UsersController" class', () => {
      expect(tree.readContent('/users/users.controller.ts'))
        .toEqual(`import { Controller } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
}
`);
    });

    it('should generate "UsersService" class', () => {
      expect(tree.readContent('/users/users.service.ts'))
        .toEqual(`import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BannerMember } from '@vori/types/User';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>
  ) {}
}
`);
    });

    it('should generate "UsersModule" class', () => {
      expect(tree.readContent('/users/users.module.ts'))
        .toEqual(`import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
`);
    });

    it('should not generate "User" class', () => {
      expect(tree.readContent('/users/entities/user.entity.ts')).toEqual('');
    });

    it('should not generate "CreateUserDto" class', () => {
      expect(tree.readContent('/users/dto/create-user.dto.ts')).toEqual('');
    });

    it('should not generate "UpdateUserDto" class', () => {
      expect(tree.readContent('/users/dto/update-user.dto.ts')).toEqual('');
    });
  });

  describe('[WebSockets]', () => {
    it('should generate appropriate files ', async () => {
      const options: ResourceOptions = {
        name: 'users',
        type: 'ws',
      };
      const tree = await runner
        .runSchematicAsync('resource', options)
        .toPromise();
      const files = tree.files;
      expect(files).toEqual([
        '/users/users.gateway.spec.ts',
        '/users/users.gateway.ts',
        '/users/users.module.ts',
        '/users/users.service.spec.ts',
        '/users/users.service.ts',
        '/users/dto/user.dto.spec.ts',
        '/users/dto/user.dto.ts',
        '/users/entities/user.entity.ts',
        '/users/fakers/user.faker.ts',
      ]);
    });
    describe('when "crud" option is not enabled', () => {
      it('should generate appropriate files (without dtos)', async () => {
        const options: ResourceOptions = {
          name: 'users',
          crud: false,
          type: 'ws',
        };
        const tree = await runner
          .runSchematicAsync('resource', options)
          .toPromise();
        const files = tree.files;
        expect(files).toEqual([
          '/users/users.gateway.spec.ts',
          '/users/users.gateway.ts',
          '/users/users.module.ts',
          '/users/users.service.spec.ts',
          '/users/users.service.ts',
          '/users/fakers/user.faker.ts',
        ]);
      });
    });
    describe('when "spec" option is not enabled', () => {
      it('should generate appropriate files (without dtos)', async () => {
        const options: ResourceOptions = {
          name: 'users',
          spec: false,
          crud: false,
          type: 'ws',
        };
        const tree = await runner
          .runSchematicAsync('resource', options)
          .toPromise();
        const files = tree.files;
        expect(files).toEqual([
          '/users/users.gateway.ts',
          '/users/users.module.ts',
          '/users/users.service.ts',
          '/users/fakers/user.faker.ts',
        ]);
      });
    });
  });

  describe('[WebSockets]', () => {
    const options: ResourceOptions = {
      name: 'users',
      crud: true,
      type: 'ws',
    };

    let tree: UnitTestTree;

    beforeAll(async () => {
      tree = await runner.runSchematicAsync('resource', options).toPromise();
    });

    it('should generate "UsersGateway" class', () => {
      expect(tree.readContent('/users/users.gateway.ts'))
        .toEqual(`import { WebSocketGateway, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

@WebSocketGateway()
export class UsersGateway {
  constructor(private readonly usersService: UsersService) {}

  @SubscribeMessage('createUser')
  create(@MessageBody() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @SubscribeMessage('findAllUsers')
  findAll() {
    return this.usersService.findAll();
  }

  @SubscribeMessage('findOneUser')
  findOne(@MessageBody() id: number) {
    return this.usersService.findOne(id);
  }

  @SubscribeMessage('updateUser')
  update(@MessageBody() updateUserDto: UpdateUserDto) {
    return this.usersService.update(updateUserDto.id, updateUserDto);
  }

  @SubscribeMessage('removeUser')
  remove(@MessageBody() id: number) {
    return this.usersService.remove(id);
  }
}
`);
    });
    it('should generate "UsersService" class', () => {
      expect(tree.readContent('/users/users.service.ts'))
        .toEqual(`import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BannerMember } from '@vori/types/User';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>
  ) {}

  public async create(user: BannerMember, createUserDto: CreateUserDto): Promise<User> {
    return 'This action adds a new user';
  }

  public async findAll(user: BannerMember): Promise<User[]> {
    return \`This action returns all users\`;
  }

  public async findOne(user: BannerMember, id: string): Promise<User> {
    return \`This action returns a #\${id} user\`;
  }

  public async update(user: BannerMember, id: string, updateUserDto: UpdateUserDto): Promise<User> {
    return \`This action updates a #\${id} user\`;
  }

  public async remove(user: BannerMember, id: string): Promise<void> {
    return \`This action removes a #\${id} user\`;
  }
}
`);
    });

    it('should generate "UsersModule" class', () => {
      expect(tree.readContent('/users/users.module.ts'))
        .toEqual(`import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UsersGateway } from './users.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersGateway, UsersService],
})
export class UsersModule {}
`);
    });

    it('should generate "User" class', () => {
      expect(tree.readContent('/users/entities/user.entity.ts'))
        .toEqual(`import { Entity } from 'typeorm';
import { BaseEntity } from '@vori/types/BaseEntity';

// TODO Remember to add your new entity to getDataBaseEntities.
@Entity('users')
export class User extends BaseEntity {}
`);
    });

    it('should generate "CreateUserDto" and "UpdateUserDto" classes', () => {
      expect(tree.readContent('/users/dto/user.dto.ts')).toEqual(
        `import { PartialType } from '@nestjs/mapped-types';
import { BaseEntityDto } from '@vori/nest/libs/dto';
import { User } from '../entities/user.entity';

export class UserDto extends BaseEntityDto {
  public static from(user: User): UserDto {
    return {
      ...BaseEntityDto.from(user),
    };
  }
}

export class CreateUserDto {}

export class UpdateUserDto extends PartialType(CreateUserDto) {}
`,
      );
    });

    it('should generate "UsersGateway" spec file', () => {
      expect(tree.readContent('/users/users.gateway.spec.ts'))
        .toEqual(`import { Test, TestingModule } from '@nestjs/testing';
import { UsersGateway } from './users.gateway';
import { UsersService } from './users.service';

describe('UsersGateway', () => {
  let gateway: UsersGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersGateway, UsersService],
    }).compile();

    gateway = module.get<UsersGateway>(UsersGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
`);
    });

    it('should generate "UsersService" spec file', () => {
      expect(tree.readContent('/users/users.service.spec.ts'))
        .toEqual(`import { TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { TransactionalTestContext } from 'typeorm-transactional-tests';
import { createTestingModule } from '@vori/nest/libs/test_helpers';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

describe('UsersService', () => {
  let module: TestingModule;
  let db: DataSource;
  let transactionalContext: TransactionalTestContext;
  let service: UsersService;

  beforeEach(async () => {
    module = await createTestingModule({
      imports: [
        TypeOrmModule.forFeature([User]),
      ],
      providers: [UsersService],
    }).compile();

    await module.init();

    db = module.get<DataSource>(DataSource);
    service = module.get<UsersService>(UsersService);
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
`);
    });
  });

  describe('[WebSockets - with "crud" disabled]', () => {
    const options: ResourceOptions = {
      name: 'users',
      crud: false,
      spec: false,
      type: 'ws',
    };

    let tree: UnitTestTree;

    beforeAll(async () => {
      tree = await runner.runSchematicAsync('resource', options).toPromise();
    });

    it('should generate "UsersGateway" class', () => {
      expect(tree.readContent('/users/users.gateway.ts'))
        .toEqual(`import { WebSocketGateway } from '@nestjs/websockets';
import { UsersService } from './users.service';

@WebSocketGateway()
export class UsersGateway {
  constructor(private readonly usersService: UsersService) {}
}
`);
    });
    it('should generate "UsersService" class', () => {
      expect(tree.readContent('/users/users.service.ts'))
        .toEqual(`import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BannerMember } from '@vori/types/User';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>
  ) {}
}
`);
    });

    it('should generate "UsersModule" class', () => {
      expect(tree.readContent('/users/users.module.ts'))
        .toEqual(`import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UsersGateway } from './users.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersGateway, UsersService],
})
export class UsersModule {}
`);
    });

    it('should not generate "User" class', () => {
      expect(tree.readContent('/users/entities/user.entity.ts')).toEqual('');
    });

    it('should not generate "CreateUserDto" class', () => {
      expect(tree.readContent('/users/dto/create-user.dto.ts')).toEqual('');
    });

    it('should not generate "UpdateUserDto" class', () => {
      expect(tree.readContent('/users/dto/update-user.dto.ts')).toEqual('');
    });
  });

  describe('[GraphQL - Code first]', () => {
    it('should generate appropriate files ', async () => {
      const options: ResourceOptions = {
        name: 'users',
        crud: true,
        type: 'graphql-code-first',
      };
      const tree = await runner
        .runSchematicAsync('resource', options)
        .toPromise();
      const files = tree.files;
      expect(files).toEqual([
        '/users/users.module.ts',
        '/users/users.resolver.spec.ts',
        '/users/users.resolver.ts',
        '/users/users.service.spec.ts',
        '/users/users.service.ts',
        '/users/dto/create-user.input.ts',
        '/users/dto/update-user.input.ts',
        '/users/entities/user.entity.ts',
        '/users/fakers/user.faker.ts',
      ]);
    });
    describe('when "crud" option is not enabled', () => {
      it('should generate appropriate files (without dtos)', async () => {
        const options: ResourceOptions = {
          name: 'users',
          crud: false,
          type: 'graphql-code-first',
        };
        const tree = await runner
          .runSchematicAsync('resource', options)
          .toPromise();
        const files = tree.files;
        expect(files).toEqual([
          '/users/users.module.ts',
          '/users/users.resolver.spec.ts',
          '/users/users.resolver.ts',
          '/users/users.service.spec.ts',
          '/users/users.service.ts',
          '/users/fakers/user.faker.ts',
        ]);
      });
    });
    describe('when "spec" option is not enabled', () => {
      it('should generate appropriate files (without dtos)', async () => {
        const options: ResourceOptions = {
          name: 'users',
          spec: false,
          crud: false,
          type: 'graphql-code-first',
        };
        const tree = await runner
          .runSchematicAsync('resource', options)
          .toPromise();
        const files = tree.files;
        expect(files).toEqual([
          '/users/users.module.ts',
          '/users/users.resolver.ts',
          '/users/users.service.ts',
          '/users/fakers/user.faker.ts',
        ]);
      });
    });
  });
  describe('[GraphQL - Code first]', () => {
    const options: ResourceOptions = {
      name: 'users',
      crud: true,
      type: 'graphql-code-first',
    };

    let tree: UnitTestTree;

    beforeAll(async () => {
      tree = await runner.runSchematicAsync('resource', options).toPromise();
    });

    it('should generate "UsersResolver" class', () => {
      expect(tree.readContent('/users/users.resolver.ts'))
        .toEqual(`import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Mutation(() => User)
  createUser(@Args('createUserInput') createUserInput: CreateUserInput) {
    return this.usersService.create(createUserInput);
  }

  @Query(() => [User], { name: 'users' })
  findAll() {
    return this.usersService.findAll();
  }

  @Query(() => User, { name: 'user' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.usersService.findOne(id);
  }

  @Mutation(() => User)
  updateUser(@Args('updateUserInput') updateUserInput: UpdateUserInput) {
    return this.usersService.update(updateUserInput.id, updateUserInput);
  }

  @Mutation(() => User)
  removeUser(@Args('id', { type: () => Int }) id: number) {
    return this.usersService.remove(id);
  }
}
`);
    });
    it('should generate "UsersService" class', () => {
      expect(tree.readContent('/users/users.service.ts'))
        .toEqual(`import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BannerMember } from '@vori/types/User';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>
  ) {}

  public async create(createUserInput: CreateUserInput): Promise<User> {
    return 'This action adds a new user';
  }

  public async findAll(user: BannerMember): Promise<User[]> {
    return \`This action returns all users\`;
  }

  public async findOne(user: BannerMember, id: string): Promise<User> {
    return \`This action returns a #\${id} user\`;
  }

  public async update(user: BannerMember, id: string, updateUserInput: UpdateUserInput): Promise<User> {
    return \`This action updates a #\${id} user\`;
  }

  public async remove(user: BannerMember, id: string): Promise<void> {
    return \`This action removes a #\${id} user\`;
  }
}
`);
    });

    it('should generate "UsersModule" class', () => {
      expect(tree.readContent('/users/users.module.ts'))
        .toEqual(`import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersResolver, UsersService],
})
export class UsersModule {}
`);
    });

    it('should generate "User" class', () => {
      expect(tree.readContent('/users/entities/user.entity.ts'))
        .toEqual(`import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class User {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
`);
    });

    it('should generate "CreateUserInput" class', () => {
      expect(tree.readContent('/users/dto/create-user.input.ts')).toEqual(
        `import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateUserInput {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
`,
      );
    });

    it('should generate "UpdateUserInput" class', () => {
      expect(tree.readContent('/users/dto/update-user.input.ts'))
        .toEqual(`import { CreateUserInput } from './create-user.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateUserInput extends PartialType(CreateUserInput) {
  @Field(() => Int)
  id: number;
}
`);
    });

    it('should generate "UsersResolver" spec file', () => {
      expect(tree.readContent('/users/users.resolver.spec.ts'))
        .toEqual(`import { Test, TestingModule } from '@nestjs/testing';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';

describe('UsersResolver', () => {
  let resolver: UsersResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersResolver, UsersService],
    }).compile();

    resolver = module.get<UsersResolver>(UsersResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
`);
    });

    it('should generate "UsersService" spec file', () => {
      expect(tree.readContent('/users/users.service.spec.ts'))
        .toEqual(`import { TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { TransactionalTestContext } from 'typeorm-transactional-tests';
import { createTestingModule } from '@vori/nest/libs/test_helpers';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

describe('UsersService', () => {
  let module: TestingModule;
  let db: DataSource;
  let transactionalContext: TransactionalTestContext;
  let service: UsersService;

  beforeEach(async () => {
    module = await createTestingModule({
      imports: [
        TypeOrmModule.forFeature([User]),
      ],
      providers: [UsersService],
    }).compile();

    await module.init();

    db = module.get<DataSource>(DataSource);
    service = module.get<UsersService>(UsersService);
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
`);
    });
  });

  describe('[GraphQL - Schema first]', () => {
    it('should generate appropriate files ', async () => {
      const options: ResourceOptions = {
        name: 'users',
        type: 'graphql-schema-first',
      };
      const tree = await runner
        .runSchematicAsync('resource', options)
        .toPromise();
      const files = tree.files;
      expect(files).toEqual([
        '/users/users.graphql',
        '/users/users.module.ts',
        '/users/users.resolver.spec.ts',
        '/users/users.resolver.ts',
        '/users/users.service.spec.ts',
        '/users/users.service.ts',
        '/users/dto/create-user.input.ts',
        '/users/dto/update-user.input.ts',
        '/users/entities/user.entity.ts',
        '/users/fakers/user.faker.ts',
      ]);
    });
    describe('when "crud" option is not enabled', () => {
      it('should generate appropriate files (without dtos)', async () => {
        const options: ResourceOptions = {
          name: 'users',
          crud: false,
          type: 'graphql-schema-first',
        };
        const tree = await runner
          .runSchematicAsync('resource', options)
          .toPromise();
        const files = tree.files;
        expect(files).toEqual([
          '/users/users.module.ts',
          '/users/users.resolver.spec.ts',
          '/users/users.resolver.ts',
          '/users/users.service.spec.ts',
          '/users/users.service.ts',
          '/users/fakers/user.faker.ts',
        ]);
      });
    });
    describe('when "spec" option is not enabled', () => {
      it('should generate appropriate files (without dtos)', async () => {
        const options: ResourceOptions = {
          name: 'users',
          spec: false,
          crud: false,
          type: 'graphql-schema-first',
        };
        const tree = await runner
          .runSchematicAsync('resource', options)
          .toPromise();
        const files = tree.files;
        expect(files).toEqual([
          '/users/users.module.ts',
          '/users/users.resolver.ts',
          '/users/users.service.ts',
          '/users/fakers/user.faker.ts',
        ]);
      });
    });
  });
  describe('[GraphQL - Schema first]', () => {
    const options: ResourceOptions = {
      name: 'users',
      type: 'graphql-schema-first',
    };

    let tree: UnitTestTree;

    beforeAll(async () => {
      tree = await runner.runSchematicAsync('resource', options).toPromise();
    });

    it('should generate "UsersResolver" class', () => {
      expect(tree.readContent('/users/users.resolver.ts'))
        .toEqual(`import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';

@Resolver('User')
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Mutation('createUser')
  create(@Args('createUserInput') createUserInput: CreateUserInput) {
    return this.usersService.create(createUserInput);
  }

  @Query('users')
  findAll() {
    return this.usersService.findAll();
  }

  @Query('user')
  findOne(@Args('id') id: number) {
    return this.usersService.findOne(id);
  }

  @Mutation('updateUser')
  update(@Args('updateUserInput') updateUserInput: UpdateUserInput) {
    return this.usersService.update(updateUserInput.id, updateUserInput);
  }

  @Mutation('removeUser')
  remove(@Args('id') id: number) {
    return this.usersService.remove(id);
  }
}
`);
    });
    it('should generate "UsersService" class', () => {
      expect(tree.readContent('/users/users.service.ts'))
        .toEqual(`import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BannerMember } from '@vori/types/User';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>
  ) {}

  public async create(createUserInput: CreateUserInput): Promise<User> {
    return 'This action adds a new user';
  }

  public async findAll(user: BannerMember): Promise<User[]> {
    return \`This action returns all users\`;
  }

  public async findOne(user: BannerMember, id: string): Promise<User> {
    return \`This action returns a #\${id} user\`;
  }

  public async update(user: BannerMember, id: string, updateUserInput: UpdateUserInput): Promise<User> {
    return \`This action updates a #\${id} user\`;
  }

  public async remove(user: BannerMember, id: string): Promise<void> {
    return \`This action removes a #\${id} user\`;
  }
}
`);
    });

    it('should generate "UsersModule" class', () => {
      expect(tree.readContent('/users/users.module.ts'))
        .toEqual(`import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersResolver, UsersService],
})
export class UsersModule {}
`);
    });

    it('should generate "User" class', () => {
      expect(tree.readContent('/users/entities/user.entity.ts'))
        .toEqual(`import { Entity } from 'typeorm';
import { BaseEntity } from '@vori/types/BaseEntity';

// TODO Remember to add your new entity to getDataBaseEntities.
@Entity('users')
export class User extends BaseEntity {}
`);
    });

    it('should generate "CreateUserInput" class', () => {
      expect(tree.readContent('/users/dto/create-user.input.ts')).toEqual(
        `export class CreateUserInput {}
`,
      );
    });

    it('should generate "UpdateUserInput" class', () => {
      expect(tree.readContent('/users/dto/update-user.input.ts'))
        .toEqual(`import { CreateUserInput } from './create-user.input';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateUserInput extends PartialType(CreateUserInput) {
  id: number;
}
`);
    });

    it('should generate "UsersResolver" spec file', () => {
      expect(tree.readContent('/users/users.resolver.spec.ts'))
        .toEqual(`import { Test, TestingModule } from '@nestjs/testing';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';

describe('UsersResolver', () => {
  let resolver: UsersResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersResolver, UsersService],
    }).compile();

    resolver = module.get<UsersResolver>(UsersResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
`);
    });

    it('should generate "UsersService" spec file', () => {
      expect(tree.readContent('/users/users.service.spec.ts'))
        .toEqual(`import { TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { TransactionalTestContext } from 'typeorm-transactional-tests';
import { createTestingModule } from '@vori/nest/libs/test_helpers';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

describe('UsersService', () => {
  let module: TestingModule;
  let db: DataSource;
  let transactionalContext: TransactionalTestContext;
  let service: UsersService;

  beforeEach(async () => {
    module = await createTestingModule({
      imports: [
        TypeOrmModule.forFeature([User]),
      ],
      providers: [UsersService],
    }).compile();

    await module.init();

    db = module.get<DataSource>(DataSource);
    service = module.get<UsersService>(UsersService);
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
`);
    });

    it('should generate "Users" GraphQL file', () => {
      expect(tree.readContent('/users/users.graphql')).toEqual(`type User {
  # Example field (placeholder)
  exampleField: Int
}

input CreateUserInput {
  # Example field (placeholder)
  exampleField: Int
}

input UpdateUserInput {
  id: Int!
}

type Query {
  users: [User]!
  user(id: Int!): User
}

type Mutation {
  createUser(createUserInput: CreateUserInput!): User!
  updateUser(updateUserInput: UpdateUserInput!): User!
  removeUser(id: Int!): User
}
`);
    });
  });
  it('should create spec files', async () => {
    const options: ResourceOptions = {
      name: 'foo',
      spec: true,
      flat: true,
    };
    const tree: UnitTestTree = await runner
      .runSchematicAsync('resource', options)
      .toPromise();
    const files: string[] = tree.files;

    expect(
      files.find((filename) => filename === '/foo.controller.spec.ts'),
    ).toBeDefined();
    expect(
      files.find((filename) => filename === '/foo.service.spec.ts'),
    ).toBeDefined();
  });
  it('should create spec files with custom file suffix', async () => {
    const options: ResourceOptions = {
      name: 'foo',
      spec: true,
      specFileSuffix: 'test',
      flat: true,
    };
    const tree: UnitTestTree = await runner
      .runSchematicAsync('resource', options)
      .toPromise();
    const files: string[] = tree.files;

    expect(
      files.find((filename) => filename === '/foo.controller.spec.ts'),
    ).toBeUndefined();
    expect(
      files.find((filename) => filename === '/foo.controller.test.ts'),
    ).toBeDefined();

    expect(
      files.find((filename) => filename === '/foo.service.spec.ts'),
    ).toBeUndefined();
    expect(
      files.find((filename) => filename === '/foo.service.test.ts'),
    ).toBeDefined();
  });
});
