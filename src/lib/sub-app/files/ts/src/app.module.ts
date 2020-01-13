import { Module } from '@nestjs/common';
import { <%= classify(name) || 'App' %>Controller } from './app.controller';
import { <%= classify(name) || 'App' %>Service } from './app.service';

@Module({
  imports: [],
  controllers: [<%= classify(name) || 'App' %>Controller],
  providers: [<%= classify(name) || 'App' %>Service],
})
export class <%= classify(name) || 'App' %>Module {}
