import { Create<%= singular(classify(name)) %>Command } from '../commands/create-<%= singular(name) %>.command';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

@CommandHandler(Create<%= singular(classify(name)) %>Command)
export class Create<%= singular(classify(name)) %>Handler implements ICommandHandler<Create<%= singular(classify(name)) %>Command> {
  constructor(@InjectQueue('<%= classify(name) %>-queue') private <%= classify(name) %>Queue: Queue) {}

  async execute(command: Create<%= singular(classify(name)) %>Command) {
    return this.<%= classify(name) %>Queue.add('create-<%= classify(name) %>', {
      dto: command.dto
    });
  }
}
