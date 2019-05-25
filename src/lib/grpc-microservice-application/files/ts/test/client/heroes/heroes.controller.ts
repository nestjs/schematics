import { Controller, OnModuleInit, Get, Param } from '@nestjs/common';
import { Client, Transport, ClientGrpc } from '@nestjs/microservices';
import { join } from 'path';
import { Observable } from 'rxjs';
import { IHeroService } from './heroes.service';

@Controller('heroes')
export class HeroesController implements OnModuleInit {
  @Client({
    transport: Transport.GRPC,
    options: {
      package: 'hero',
      protoPath: join(process.cwd(), 'proto/hero.proto'),
    },
  })
  private readonly client: ClientGrpc;

  private heroes: IHeroService;

  public onModuleInit() {
    this.heroes = this.client.getService<IHeroService>('HeroService');
  }

  @Get(':id')
  public findOne(@Param('id') id: string): Observable<any> {
    return this.heroes.findOne({ id: parseInt(id, 10) });
  }
}
