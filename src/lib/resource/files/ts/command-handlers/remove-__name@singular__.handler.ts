import { Remove<%= singular(classify(name)) %>Command } from '../commands/remove-<%= singular(name) %>.command';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

@CommandHandler(Remove<%= singular(classify(name)) %>Command)
export class Remove<%= singular(classify(name)) %>Handler implements ICommandHandler<Remove<%= singular(classify(name)) %>Command> {
  constructor(@InjectQueue('<%= singular(name) %>-queue') private <%= singular(classify(name)) %>Queue: Queue) {}

  async execute(command: Remove<%= singular(classify(name)) %>Command) {
    return this.<%= singular(classify(name)) %>Queue.add('remove-<%= singular(name) %>', {
      id: command.id
    });
  }
}
