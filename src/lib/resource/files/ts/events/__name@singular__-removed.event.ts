export class <%= singular(classify(name)) %>RemovedEvent {
  constructor(public readonly <%= singular(name) %>Id: number) {}
}
