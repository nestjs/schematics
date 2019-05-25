import { Module } from '@nestjs/common';
import { HeroesModule } from './heroes';

@Module({
  imports: [
    HeroesModule,
  ],
})
export class ClientModule {}
