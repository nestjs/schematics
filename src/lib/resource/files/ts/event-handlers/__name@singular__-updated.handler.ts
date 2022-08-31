import { <%= singular(classify(name)) %>UpdatedEvent } from '../events/<%= singular(name) %>-updated.event';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { <%= singular(classify(name)) %> } from '../entities/<%= singular(name) %>.entity';

@EventsHandler(<%= singular(classify(name)) %>UpdatedEvent)
export class <%= singular(classify(name)) %>UpdatedHandler
  implements IEventHandler<<%= singular(classify(name)) %>UpdatedEvent>
{
  constructor(
    @InjectRepository(<%= singular(classify(name)) %>)
    private readonly repository: Repository<<%= singular(classify(name)) %>>,
  ) {}

  handle(event: <%= singular(classify(name)) %>UpdatedEvent) {
    console.log('<%= singular(classify(name)) %>UpdatedHandler: ', event.<%= singular(name) %>Id);
  }
}
