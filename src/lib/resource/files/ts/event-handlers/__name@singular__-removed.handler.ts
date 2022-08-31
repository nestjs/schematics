import { <%= singular(classify(name)) %>RemovedEvent } from '../events/<%= singular(name) %>-removed.event';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { <%= singular(classify(name)) %> } from '../entities/<%= singular(name) %>.entity';

@EventsHandler(<%= singular(classify(name)) %>RemovedEvent)
export class <%= singular(classify(name)) %>RemovedHandler
  implements IEventHandler<<%= singular(classify(name)) %>RemovedEvent>
{
  constructor(
    @InjectRepository(<%= singular(classify(name)) %>)
    private readonly repository: Repository<<%= singular(classify(name)) %>>,
  ) {}

  handle(event: <%= singular(classify(name)) %>RemovedEvent) {
    console.log('<%= singular(classify(name)) %>RemovedHandler: ', event.<%= singular(name) %>Id);
  }
}
