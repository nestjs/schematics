import { Controller, Get, Param } from '@nestjs/common';
import { Client, Transport } from '@nestjs/microservices';
import { join } from 'path';

@Controller('heroes')
export class HeroesController {
  @Client({
    transport: Transport.GRPC,
    options: {
      package: 'hero',
      protoPath: join(process.cwd(), 'proto/hero.proto'),
    },
  })
  client;

  heroes;

  onModuleInit() {
    this.heroes = this.client.getService('HeroService');
  }

  @Get(':id')
  findOne(@Param('id') id) {
    return this.heroes.findOne({ id: parseInt(id, 10) });
  }
}
