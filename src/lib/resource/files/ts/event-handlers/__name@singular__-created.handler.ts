import { <%= singular(classify(name)) %>CreatedEvent } from '../events/<%= singular(name) %>-created.event';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { <%= singular(classify(name)) %> } from '../entities/<%= singular(name) %>.entity';

@EventsHandler(<%= singular(classify(name)) %>CreatedEvent)
export class <%= singular(classify(name)) %>CreatedHandler
  implements IEventHandler<<%= singular(classify(name)) %>CreatedEvent>
{
  constructor(
    @InjectRepository(<%= singular(classify(name)) %>)
    private readonly repository: Repository<<%= singular(classify(name)) %>>,
  ) {}

  handle(event: <%= singular(classify(name)) %>CreatedEvent) {
    console.log('<%= singular(classify(name)) %>CreatedHandler: ', event.<%= singular(name) %>Id);
  }
}
