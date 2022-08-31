export class <%= singular(classify(name)) %>CreatedEvent {
  constructor(public readonly <%= singular(name) %>Id: number) {}
}