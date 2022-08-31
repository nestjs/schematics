import { Create<%= singular(classify(name)) %>Dto } from '../dto/create-<%= singular(name) %>.dto';

export class Create<%= singular(classify(name)) %>Command {
  constructor(
    public readonly dto: Create<%= singular(classify(name)) %>Dto
  ) {}
}
