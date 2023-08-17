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
        type: 'rest',
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
        '/users/args/user-page.args.ts',
        '/users/input/create-user.dto.ts',
        '/users/input/update-user.dto.ts',
        '/users/output/create-user.output.ts',
        '/users/output/remove-user.output.ts',
        '/users/output/update-user.output.ts',
        '/users/type/user.type.ts',
        '/users/type/user-page.type.ts',
      ]);
    });
    it("should keep underscores in resource's path and file name", async () => {
      const options: ResourceOptions = {
        name: '_users',
        type: 'rest',
      };
      const tree = await runner
        .runSchematicAsync('resource', options)
        .toPromise();
      const files = tree.files;
      expect(files).toEqual([
        '/_users/_users.controller.spec.ts',
        '/_users/_users.controller.ts',
        '/_users/_users.module.ts',
        '/_users/_users.service.spec.ts',
        '/_users/_users.service.ts',
        '/_users/args/_user-page.args.ts',
        '/_users/input/create-_user.dto.ts',
        '/_users/input/update-_user.dto.ts',
        '/_users/output/create-_user.output.ts',
        '/_users/output/remove-_user.output.ts',
        '/_users/output/update-_user.output.ts',
        '/_users/type/_user.type.ts',
        '/_users/type/_user-page.type.ts',
      ]);
    });
    describe('when "crud" option is not enabled', () => {
      it('should generate appropriate files (without dtos)', async () => {
        const options: ResourceOptions = {
          name: 'users',
          type: 'rest',
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
          '/users/args/user-page.args.ts',
          '/users/output/create-user.output.ts',
          '/users/output/remove-user.output.ts',
          '/users/output/update-user.output.ts',
        ]);
      });
    });
    describe('when "spec" option is not enabled', () => {
      it('should generate appropriate files (without dtos)', async () => {
        const options: ResourceOptions = {
          name: 'users',
          type: 'rest',
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
          '/users/args/user-page.args.ts',
          '/users/output/create-user.output.ts',
          '/users/output/remove-user.output.ts',
          '/users/output/update-user.output.ts',
        ]);
      });
    });
  });

  describe('[REST API]', () => {
    const options: ResourceOptions = {
      name: 'users',
      type: 'rest',
      isSwaggerInstalled: true,
    };

    let tree: UnitTestTree;

    beforeAll(async () => {
      tree = await runner.runSchematicAsync('resource', options).toPromise();
    });

    it('should generate "UsersController" class', () => {
      expect(tree.readContent('/users/users.controller.ts'))
        .toEqual(`import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './input/create-user.dto';
import { UpdateUserDto } from './input/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
`);
    });

    it('should generate "UsersService" class', () => {
      expect(tree.readContent('/users/users.service.ts'))
        .toEqual(`import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './input/create-user.dto';
import { UpdateUserDto } from './input/update-user.dto';

@Injectable()
export class UserService {
  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  findAll() {
    return \`This action returns all users\`;
  }

  findOne(id: number) {
    return \`This action returns a #\${id} user\`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return \`This action updates a #\${id} user\`;
  }

  remove(id: number) {
    return \`This action removes a #\${id} user\`;
  }
}
`);
    });

    it('should generate "UsersModule" class', () => {
      expect(tree.readContent('/users/users.module.ts'))
        .toEqual(`import { Module } from '@nestjs/common';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
`);
    });

    it('should generate "User" class', () => {
      expect(tree.readContent('/users/type/user.type.ts'))
        .toEqual(`export class UserType {}
`);
    });

    it('should generate "CreateUserDto" class', () => {
      expect(tree.readContent('/users/input/create-user.dto.ts')).toEqual(
        `export class CreateUserDto {}
`,
      );
    });

    it('should generate "UpdateUserDto" class', () => {
      expect(tree.readContent('/users/input/update-user.dto.ts'))
        .toEqual(`import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {}
`);
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
        .toEqual(`import { Test, TestingModule } from '@nestjs/testing';

import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(
      UsersService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
`);
    });
  });

  describe('[REST API - with "crud" disabled]', () => {
    const options: ResourceOptions = {
      name: 'users',
      type: 'rest',
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

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
}
`);
    });

    it('should generate "UsersService" class', () => {
      expect(tree.readContent('/users/users.service.ts'))
        .toEqual(`import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {}
`);
    });

    it('should generate "UsersModule" class', () => {
      expect(tree.readContent('/users/users.module.ts'))
        .toEqual(`import { Module } from '@nestjs/common';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
`);
    });

    it('should not generate "User" class', () => {
      expect(tree.readContent('/users/type/user.type.ts')).toEqual('');
    });

    it('should not generate "CreateUserDto" class', () => {
      expect(tree.readContent('/users/input/create-user.dto.ts')).toEqual('');
    });

    it('should not generate "UpdateUserDto" class', () => {
      expect(tree.readContent('/users/input/update-user.dto.ts')).toEqual('');
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
        '/users/args/user-page.args.ts',
        '/users/input/create-user.dto.ts',
        '/users/input/update-user.dto.ts',
        '/users/output/create-user.output.ts',
        '/users/output/remove-user.output.ts',
        '/users/output/update-user.output.ts',
        '/users/type/user.type.ts',
        '/users/type/user-page.type.ts',
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
          '/users/args/user-page.args.ts',
          '/users/output/create-user.output.ts',
          '/users/output/remove-user.output.ts',
          '/users/output/update-user.output.ts',
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
          '/users/args/user-page.args.ts',
          '/users/output/create-user.output.ts',
          '/users/output/remove-user.output.ts',
          '/users/output/update-user.output.ts',
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
import { CreateUserDto } from './input/create-user.dto';
import { UpdateUserDto } from './input/update-user.dto';

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
import { CreateUserDto } from './input/create-user.dto';
import { UpdateUserDto } from './input/update-user.dto';

@Injectable()
export class UserService {
  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  findAll() {
    return \`This action returns all users\`;
  }

  findOne(id: number) {
    return \`This action returns a #\${id} user\`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return \`This action updates a #\${id} user\`;
  }

  remove(id: number) {
    return \`This action removes a #\${id} user\`;
  }
}
`);
    });

    it('should generate "UsersModule" class', () => {
      expect(tree.readContent('/users/users.module.ts'))
        .toEqual(`import { Module } from '@nestjs/common';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
`);
    });

    it('should generate "User" class', () => {
      expect(tree.readContent('/users/type/user.type.ts'))
        .toEqual(`export class UserType {}
`);
    });

    it('should generate "CreateUserDto" class', () => {
      expect(tree.readContent('/users/input/create-user.dto.ts')).toEqual(
        `export class CreateUserDto {}
`,
      );
    });

    it('should generate "UpdateUserDto" class', () => {
      expect(tree.readContent('/users/input/update-user.dto.ts'))
        .toEqual(`import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  id: number;
}
`);
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
        .toEqual(`import { Test, TestingModule } from '@nestjs/testing';

import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(
      UsersService,
    );
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

@Injectable()
export class UserService {}
`);
    });

    it('should generate "UsersModule" class', () => {
      expect(tree.readContent('/users/users.module.ts'))
        .toEqual(`import { Module } from '@nestjs/common';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
`);
    });

    it('should not generate "User" class', () => {
      expect(tree.readContent('/users/type/user.type.ts')).toEqual('');
    });

    it('should not generate "CreateUserDto" class', () => {
      expect(tree.readContent('/users/input/create-user.dto.ts')).toEqual('');
    });

    it('should not generate "UpdateUserDto" class', () => {
      expect(tree.readContent('/users/input/update-user.dto.ts')).toEqual('');
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
        '/users/args/user-page.args.ts',
        '/users/input/create-user.dto.ts',
        '/users/input/update-user.dto.ts',
        '/users/output/create-user.output.ts',
        '/users/output/remove-user.output.ts',
        '/users/output/update-user.output.ts',
        '/users/type/user.type.ts',
        '/users/type/user-page.type.ts',
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
          '/users/args/user-page.args.ts',
          '/users/output/create-user.output.ts',
          '/users/output/remove-user.output.ts',
          '/users/output/update-user.output.ts',
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
          '/users/args/user-page.args.ts',
          '/users/output/create-user.output.ts',
          '/users/output/remove-user.output.ts',
          '/users/output/update-user.output.ts',
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
import { CreateUserDto } from './input/create-user.dto';
import { UpdateUserDto } from './input/update-user.dto';

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
import { CreateUserDto } from './input/create-user.dto';
import { UpdateUserDto } from './input/update-user.dto';

@Injectable()
export class UserService {
  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  findAll() {
    return \`This action returns all users\`;
  }

  findOne(id: number) {
    return \`This action returns a #\${id} user\`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return \`This action updates a #\${id} user\`;
  }

  remove(id: number) {
    return \`This action removes a #\${id} user\`;
  }
}
`);
    });

    it('should generate "UsersModule" class', () => {
      expect(tree.readContent('/users/users.module.ts'))
        .toEqual(`import { Module } from '@nestjs/common';

import { UsersGateway } from './users.gateway';
import { UsersService } from './users.service';

@Module({
  providers: [UsersGateway, UsersService],
})
export class UsersModule {}
`);
    });

    it('should generate "User" class', () => {
      expect(tree.readContent('/users/type/user.type.ts'))
        .toEqual(`export class UserType {}
`);
    });

    it('should generate "CreateUserDto" class', () => {
      expect(tree.readContent('/users/input/create-user.dto.ts')).toEqual(
        `export class CreateUserDto {}
`,
      );
    });

    it('should generate "UpdateUserDto" class', () => {
      expect(tree.readContent('/users/input/update-user.dto.ts'))
        .toEqual(`import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  id: number;
}
`);
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
        .toEqual(`import { Test, TestingModule } from '@nestjs/testing';

import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(
      UsersService,
    );
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

@Injectable()
export class UserService {}
`);
    });

    it('should generate "UsersModule" class', () => {
      expect(tree.readContent('/users/users.module.ts'))
        .toEqual(`import { Module } from '@nestjs/common';

import { UsersGateway } from './users.gateway';
import { UsersService } from './users.service';

@Module({
  providers: [UsersGateway, UsersService],
})
export class UsersModule {}
`);
    });

    it('should not generate "User" class', () => {
      expect(tree.readContent('/users/type/user.type.ts')).toEqual('');
    });

    it('should not generate "CreateUserDto" class', () => {
      expect(tree.readContent('/users/input/create-user.dto.ts')).toEqual('');
    });

    it('should not generate "UpdateUserDto" class', () => {
      expect(tree.readContent('/users/input/update-user.dto.ts')).toEqual('');
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
        '/users/args/user-page.args.ts',
        '/users/input/user-order.input.ts',
        '/users/input/user-where.input.ts',
        '/users/input/create-user.input.ts',
        '/users/input/remove-user.input.ts',
        '/users/input/update-user.input.ts',
        '/users/output/create-user.output.ts',
        '/users/output/remove-user.output.ts',
        '/users/output/update-user.output.ts',
        '/users/type/user.type.ts',
        '/users/type/user-page.type.ts',
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
          '/users/args/user-page.args.ts',
          '/users/output/create-user.output.ts',
          '/users/output/remove-user.output.ts',
          '/users/output/update-user.output.ts',
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
          '/users/args/user-page.args.ts',
          '/users/output/create-user.output.ts',
          '/users/output/remove-user.output.ts',
          '/users/output/update-user.output.ts',
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
        .toEqual(`import assert from 'assert';

import { Args, Context, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Maybe } from 'graphql/jsutils/Maybe';

import { AuthedGraphQLContext } from '../common/service-metadata.interface';
import { IGraphQLContext } from '../graphql-context.service';
import { UserPageArgs } from './args/user-page.args';
import { CreateUserInput } from './input/create-user.input';
import { RemoveUserInput } from './input/remove-user.input';
import { UpdateUserInput } from './input/update-user.input';
import { UserService } from './users.service';
import { CreateUserOutput } from './output/create-user.output';
import { RemoveUserOutput } from './output/remove-user.output';
import { UpdateUserOutput } from './output/update-user.output';
import { UserPageType } from './type/user-page.type';
import { UserType } from './type/user.type';

@Resolver(() => UserType)
export class UserResolver {
  constructor(
    private readonly userService: UserService,
  ) {}

  @Mutation(() => CreateUserOutput)
  async createUser(
    @Args('input') input: CreateUserInput,
    @Context() context: IGraphQLContext,
  ): Promise<CreateUserOutput> {
    assert(context.user, 'User is not authenticated');
    return this.userService.createOne(input, {
      context: context as AuthedGraphQLContext,
    });
  }

  @Query(() => UserPageType)
  async userPage(
    @Args() args: UserPageArgs,
  ): Promise<UserPageType> {
    return this.userService.findByPageArgs(args);
  }

  @Query(() => UserType)
  async user(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Maybe<UserType>> {
    return this.userService.findById(id);
  }

  @Mutation(() => UpdateUserOutput)
  async updateUser(
    @Args('input') input: UpdateUserInput,
    @Context() context: IGraphQLContext,
  ): Promise<UpdateUserOutput> {
    assert(context.user, 'User is not authenticated');
    return this.userService.updateOne(input.id, input, {
      context: context as AuthedGraphQLContext,
    });
  }

  @Mutation(() => RemoveUserOutput)
  async removeUser(
    @Args('input') input: RemoveUserInput,
    @Context() context: IGraphQLContext,
  ): Promise<RemoveUserOutput> {
    assert(context.user, 'User is not authenticated');
    return this.userService.removeOne(input.id);
  }
}
`);
    });
    it('should generate "UsersService" class', () => {
      expect(tree.readContent('/users/users.service.ts'))
        .toEqual(`import { User } from '@app/db/entity/user.entity';
import { GraphqlTypeService } from '@app/graphql-type';
import { DaoIdNotFoundError } from '@app/graphql-type/error/dao-id-not-found.error';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import {
  AuthedServiceMetadata,
  ServiceMetadata,
} from '../common/service-metadata.interface';
import { UserPageArgs } from './args/user-page.args';
import { CreateUserInput } from './input/create-user.input';
import { UpdateUserInput } from './input/update-user.input';
import { CreateUserOutput } from './output/create-user.output';
import { RemoveUserOutput } from './output/remove-user.output';
import { UpdateUserOutput } from './output/update-user.output';
import { UserPageType } from './type/user-page.type';

@Injectable()
export class UserService {
  constructor(
    private readonly manager: EntityManager,
    private readonly graphqlTypeService: GraphqlTypeService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async createOne(
    input: CreateUserInput,
    { context: { user } }: AuthedServiceMetadata,
    metadata?: Pick<ServiceMetadata, 'manager'>,
  ): Promise<CreateUserOutput> {
    const create = async (manager: EntityManager) => {
      const userRepo = manager.getRepository(User);

      const user = userRepo.create(input);
      user.createdBy = user.id;
      user.updatedBy = user.id;

      await userRepo.save(
        user,
      );

      return { user };
    };

    if (metadata?.manager) {
      return create(metadata.manager);
    }

    return this.manager.transaction('READ COMMITTED', create);
  }

  async findByPageArgs(
    args: UserPageArgs,
    metadata?: Pick<ServiceMetadata, 'manager'>,
  ): Promise<UserPageType> {
    const userRepo = metadata?.manager
      ? metadata.manager.getRepository(User)
      : this.userRepo;

    const { take, skip, order, ...where } = args;

    return this.graphqlTypeService.daoNodePage(
      userRepo,
      { take, skip, order },
      where,
    );
  }

  async findById(
    id: string,
    metadata?: Pick<ServiceMetadata, 'manager'>,
  ): Promise<User | null> {
    if (metadata?.manager) {
      const userRepo = metadata.manager.getRepository(User);
      return userRepo.findOneBy({ id });
    }

    return this.userRepo.findOneBy({ id });
  }

  async updateOne(
    id: string,
    input: UpdateUserInput,
    { context: { user } }: AuthedServiceMetadata,
    metadata?: Pick<ServiceMetadata, 'manager'>,
  ): Promise<UpdateUserOutput> {
    const update = async (manager: EntityManager) => {
      const userRepo = manager.getRepository(User);

      const user = await userRepo.preload({
        ...input,
        id,
      });
      if (!user) {
        throw new DaoIdNotFoundError(User, id);
      }
      user.updatedBy = user.id;

      await userRepo.save(
        user,
      );

      return {
        user,
      };
    };

    if (metadata?.manager) {
      return update(metadata.manager);
    }

    return this.manager.transaction('READ COMMITTED', update);
  }

  async removeOne(
    id: string,
    metadata?: Pick<ServiceMetadata, 'manager'>,
  ): Promise<RemoveUserOutput> {
    const remove = async (manager: EntityManager) => {
      const userRepo = manager.getRepository(User);

      const user = await userRepo.findOneBy({ id });
      if (!user) {
        throw new DaoIdNotFoundError(User, id);
      }

      const result = await userRepo.softRemove(user);

      return {
        user: result,
      };
    };

    if (metadata?.manager) {
      return remove(metadata.manager);
    }

    return this.manager.transaction('READ COMMITTED', remove);
  }
}
`);
    });

    it('should generate "UsersModule" class', () => {
      expect(tree.readContent('/users/users.module.ts'))
        .toEqual(`import { Users } from '@app/db/entity/users.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([Users])],
  providers: [UsersResolver, UsersService],
})
export class UsersModule {}
`);
    });

    it('should generate "UserType" class', () => {
      expect(tree.readContent('/users/type/user.type.ts'))
        .toEqual(`import { DaoNode } from '@app/graphql-type/type/dao-node.type';
import { GraphNode } from '@app/graphql-type/type/graph-node.type';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('User', {
  implements: [GraphNode, DaoNode],
})
export class UserType extends DaoNode {
  @Field(() => String, { nullable: true })
  exampleField?: string;
}
`);
    });

    it('should generate "UserPageType" class', () => {
      expect(tree.readContent('/users/type/user-page.type.ts'))
        .toEqual(`import { DaoNodePage } from '@app/graphql-type/type/dao-node-page.type';
import { Field, ObjectType } from '@nestjs/graphql';

import { UserType } from './user.type';

@ObjectType('UserPage', {
  implements: [DaoNodePage],
})
export class UserPageType implements DaoNodePage<UserType> {
  @Field(() => [UserType], { description: 'Nodes in this page' })
  nodes!: UserType[];
}
`);
    });

    it('should generate "UserPageArgs" class', () => {
      expect(tree.readContent('/users/args/user-page.args.ts'))
        .toEqual(`import { DaoNodePageArgs } from '@app/graphql-type/args/dao-node-page.args';
import { ArgsType, Field } from '@nestjs/graphql';
import { Maybe } from 'graphql/jsutils/Maybe';

import { UserOrderInput } from '../input/user-order.input';
import { UserWhereInput } from '../input/user-where.input';

@ArgsType()
export class UserPageArgs extends DaoNodePageArgs {
  @Field(() => UserOrderInput, {
    description: '排序欄位與方式',
    defaultValue: new UserOrderInput(),
  })
  order: Maybe<UserOrderInput>;

  @Field(() => UserWhereInput, {
    defaultValue: new UserWhereInput(),
  })
  where: Maybe<UserWhereInput>;
}
`);
    });

    it('should generate "UserOrderInput" class', () => {
      expect(tree.readContent('/users/input/user-order.input.ts'))
        .toEqual(`import {
  DaoNodeOrderInput,
  DaoNodeOrderValue,
} from '@app/graphql-type/input/dao-node-order.input';
import { Field, InputType } from '@nestjs/graphql';
import { Maybe } from 'graphql/jsutils/Maybe';

@InputType()
export class UserOrderInput extends DaoNodeOrderInput {
  @Field(() => DaoNodeOrderValue, { nullable: true })
  exampleField?: Maybe<DaoNodeOrderValue>;
}
`);
    });

    it('should generate "UserWhereInput" class', () => {
      expect(tree.readContent('/users/input/user-where.input.ts'))
        .toEqual(`import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UserWhereInput {
  @Field(() => String, { nullable: true })
  exampleField?: string;
}
`);
    });

    it('should generate "CreateUserInput" class', () => {
      expect(tree.readContent('/users/input/create-user.input.ts'))
        .toEqual(`import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateUserInput {
  @Field(() => String, { nullable: true })
  exampleField?: string;
}
`);
    });

    it('should generate "UpdateUserInput" class', () => {
      expect(tree.readContent('/users/input/update-user.input.ts'))
        .toEqual(`import { Field, ID, InputType, PartialType } from '@nestjs/graphql';

import { CreateUserInput } from './create-user.input';

@InputType()
export class UpdateUserInput extends PartialType(
  CreateUserInput,
) {
  @Field(() => ID)
  id!: string;
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

    resolver = module.get<UsersResolver>(
      UsersResolver,
    );
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
`);
    });

    it('should generate "UsersService" spec file', () => {
      expect(tree.readContent('/users/users.service.spec.ts'))
        .toEqual(`import { Test, TestingModule } from '@nestjs/testing';

import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(
      UsersService,
    );
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
        '/users/args/user-page.args.ts',
        '/users/input/user-order.input.ts',
        '/users/input/user-where.input.ts',
        '/users/input/create-user.input.ts',
        '/users/input/remove-user.input.ts',
        '/users/input/update-user.input.ts',
        '/users/output/create-user.output.ts',
        '/users/output/remove-user.output.ts',
        '/users/output/update-user.output.ts',
        '/users/type/user.type.ts',
        '/users/type/user-page.type.ts',
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
          '/users/args/user-page.args.ts',
          '/users/output/create-user.output.ts',
          '/users/output/remove-user.output.ts',
          '/users/output/update-user.output.ts',
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
          '/users/args/user-page.args.ts',
          '/users/output/create-user.output.ts',
          '/users/output/remove-user.output.ts',
          '/users/output/update-user.output.ts',
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

import { CreateUserInput } from './input/create-user.input';
import { UpdateUserInput } from './input/update-user.input';
import { UserService } from './users.service';

@Resolver('User')
export class UserResolver {
  constructor(
    private readonly userService: UserService,
  ) {}

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
        .toEqual(`import { User } from '@app/db/entity/user.entity';
import { GraphqlTypeService } from '@app/graphql-type';
import { DaoIdNotFoundError } from '@app/graphql-type/error/dao-id-not-found.error';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import {
  AuthedServiceMetadata,
  ServiceMetadata,
} from '../common/service-metadata.interface';
import { UserPageArgs } from './args/user-page.args';
import { CreateUserInput } from './input/create-user.input';
import { UpdateUserInput } from './input/update-user.input';
import { CreateUserOutput } from './output/create-user.output';
import { RemoveUserOutput } from './output/remove-user.output';
import { UpdateUserOutput } from './output/update-user.output';
import { UserPageType } from './type/user-page.type';

@Injectable()
export class UserService {
  constructor(
    private readonly manager: EntityManager,
    private readonly graphqlTypeService: GraphqlTypeService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async createOne(
    input: CreateUserInput,
    { context: { user } }: AuthedServiceMetadata,
    metadata?: Pick<ServiceMetadata, 'manager'>,
  ): Promise<CreateUserOutput> {
    const create = async (manager: EntityManager) => {
      const userRepo = manager.getRepository(User);

      const user = userRepo.create(input);
      user.createdBy = user.id;
      user.updatedBy = user.id;

      await userRepo.save(
        user,
      );

      return { user };
    };

    if (metadata?.manager) {
      return create(metadata.manager);
    }

    return this.manager.transaction('READ COMMITTED', create);
  }

  async findByPageArgs(
    args: UserPageArgs,
    metadata?: Pick<ServiceMetadata, 'manager'>,
  ): Promise<UserPageType> {
    const userRepo = metadata?.manager
      ? metadata.manager.getRepository(User)
      : this.userRepo;

    const { take, skip, order, ...where } = args;

    return this.graphqlTypeService.daoNodePage(
      userRepo,
      { take, skip, order },
      where,
    );
  }

  async findById(
    id: string,
    metadata?: Pick<ServiceMetadata, 'manager'>,
  ): Promise<User | null> {
    if (metadata?.manager) {
      const userRepo = metadata.manager.getRepository(User);
      return userRepo.findOneBy({ id });
    }

    return this.userRepo.findOneBy({ id });
  }

  async updateOne(
    id: string,
    input: UpdateUserInput,
    { context: { user } }: AuthedServiceMetadata,
    metadata?: Pick<ServiceMetadata, 'manager'>,
  ): Promise<UpdateUserOutput> {
    const update = async (manager: EntityManager) => {
      const userRepo = manager.getRepository(User);

      const user = await userRepo.preload({
        ...input,
        id,
      });
      if (!user) {
        throw new DaoIdNotFoundError(User, id);
      }
      user.updatedBy = user.id;

      await userRepo.save(
        user,
      );

      return {
        user,
      };
    };

    if (metadata?.manager) {
      return update(metadata.manager);
    }

    return this.manager.transaction('READ COMMITTED', update);
  }

  async removeOne(
    id: string,
    metadata?: Pick<ServiceMetadata, 'manager'>,
  ): Promise<RemoveUserOutput> {
    const remove = async (manager: EntityManager) => {
      const userRepo = manager.getRepository(User);

      const user = await userRepo.findOneBy({ id });
      if (!user) {
        throw new DaoIdNotFoundError(User, id);
      }

      const result = await userRepo.softRemove(user);

      return {
        user: result,
      };
    };

    if (metadata?.manager) {
      return remove(metadata.manager);
    }

    return this.manager.transaction('READ COMMITTED', remove);
  }
}
`);
    });

    it('should generate "UsersModule" class', () => {
      expect(tree.readContent('/users/users.module.ts'))
        .toEqual(`import { Users } from '@app/db/entity/users.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([Users])],
  providers: [UsersResolver, UsersService],
})
export class UsersModule {}
`);
    });

    it('should generate "User" class', () => {
      expect(tree.readContent('/users/type/user.type.ts'))
        .toEqual(`export class UserType {}
`);
    });

    it('should generate "CreateUserInput" class', () => {
      expect(tree.readContent('/users/input/create-user.input.ts')).toEqual(
        `export class CreateUserInput {}
`,
      );
    });

    it('should generate "UpdateUserInput" class', () => {
      expect(tree.readContent('/users/input/update-user.input.ts'))
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

    resolver = module.get<UsersResolver>(
      UsersResolver,
    );
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
`);
    });

    it('should generate "UsersService" spec file', () => {
      expect(tree.readContent('/users/users.service.spec.ts'))
        .toEqual(`import { Test, TestingModule } from '@nestjs/testing';

import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(
      UsersService,
    );
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
      type: 'rest',
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
      type: 'rest',
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
