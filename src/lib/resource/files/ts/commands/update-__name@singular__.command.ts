import { Update<%= singular(classify(name)) %>Dto } from '../dto/update-<%= singular(name) %>.dto';

export class Update<%= singular(classify(name)) %>Command {
  constructor(
    public readonly id: number,
    public readonly dto: Update<%= singular(classify(name)) %>Dto
  ) {}
}
