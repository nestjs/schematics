import { Module } from '@nestjs/common';
import { <%= classify(name) %>Controller } from './<%= name %>.controller<%= isEsm ? '.js' : '' %>';
import { <%= classify(name) %>Service } from './<%= name %>.service<%= isEsm ? '.js' : '' %>';

@Module({
  imports: [],
  controllers: [<%= classify(name) %>Controller],
  providers: [<%= classify(name) %>Service],
})
export class <%= classify(name) %>Module {}
