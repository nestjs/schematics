import { Remove<%= singular(classify(name)) %>Dto } from '../dto/remove-<%= singular(name) %>.dto';

export class Remove<%= singular(classify(name)) %>Command {
  constructor(
    public readonly id: number
  ) {}
}
