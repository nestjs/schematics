import { Injectable } from '@nestjs/common';
import { Model } from 'objection';

@Injectable()
export class <%= classify(name) %>Model extends Model {
  static get tableName() {
    return '<%= singular(name) %>';
  }
}
