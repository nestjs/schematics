import { Update<%= singular(classify(name)) %>Command } from '../commands/update-<%= singular(name) %>.command';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

@CommandHandler(Update<%= singular(classify(name)) %>Command)
export class Update<%= singular(classify(name)) %>Handler implements ICommandHandler<Update<%= singular(classify(name)) %>Command> {
  constructor(@InjectQueue('<%= classify(name) %>-queue') private <%= classify(name) %>Queue: Queue) {}

  async execute(command: Update<%= singular(classify(name)) %>Command) {
    return this.<%= classify(name) %>Queue.add('update-<%= classify(name) %>', {
      id: command.id,
      dto: command.dto,
    });
  }
}
