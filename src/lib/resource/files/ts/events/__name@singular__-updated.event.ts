export class <%= singular(classify(name)) %>UpdatedEvent {
  constructor(public readonly <%= singular(name) %>Id: number) {}
}