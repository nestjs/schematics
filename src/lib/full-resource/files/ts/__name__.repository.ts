import { Inject, Injectable } from '@nestjs/common';
import { BaseRepository } from 'objectionjs-repository';
import { <%= classify(name) %>Model } from './<%= name %>.model';
import { I<%= singular(classify(name)) %> } from './<%= name %>.type';

@Injectable()
export class <%= classify(name) %>Repository extends BaseRepository<I<%= singular(classify(name)) %>> {
  constructor(@Inject('KNEX_CONNECTION') knex) {
    super(<%= classify(name) %>Model, knex);
  }
}
