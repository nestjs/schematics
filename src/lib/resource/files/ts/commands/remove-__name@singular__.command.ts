export class Remove<%= singular(classify(name)) %>Command {
  constructor(
    public readonly id: number,
    public readonly delay: number = 0
  ) {}
}
