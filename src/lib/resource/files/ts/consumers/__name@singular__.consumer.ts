import { Processor, Process, OnQueueActive } from '@nestjs/bull';
import { Job } from 'bull';
import { <%= singular(classify(name)) %>CreatedEvent } from '../events/<%= singular(name) %>-created.event';
import { <%= singular(classify(name)) %>UpdatedEvent } from '../events/<%= singular(name) %>-updated.event';
import { <%= singular(classify(name)) %>RemovedEvent } from '../events/<%= singular(name) %>-removed.event';
import { EventBus } from '@nestjs/cqrs';
import { <%= classify(name) %>Service } from '../<%= name %>.service';

@Processor('<%= singular(name) %>-queue')
export class <%= classify(name) %>Consumer {
  constructor(
    private readonly <%= singular(name) %>Service: <%= classify(name) %>Service,
    private eventBus: EventBus,
  ) {}

  @Process('create-<%= singular(name) %>')
  async create(job: Job) {
    const { dto } = job.data;
    const created = await this.<%= singular(name) %>Service.create(dto);
    if (created) {
      job.update({ id: created.id });
      await job.progress(100);
      this.eventBus.publish(new <%= singular(classify(name)) %>CreatedEvent(created.id));
    }
  }

  @Process('update-<%= singular(name) %>')
  async update(job: Job) {
    const { dto, id } = job.data;
    const updated = await this.<%= singular(name) %>Service.update(id, dto);
    if (updated) {
      job.update({ id: updated.id });
      await job.progress(100);
      this.eventBus.publish(new <%= singular(classify(name)) %>UpdatedEvent(updated.id));
    }
  }

  @Process('remove-<%= singular(name) %>')
  async remove(job: Job) {
    const removed = this.<%= singular(name) %>Service.remove(job.data.id);
    if (removed.affected === 1) {
      await job.progress(100);
      this.eventBus.publish(new <%= singular(classify(name)) %>RemovedEvent(job.data.id));
    }
    await job.discard();
  }

  @OnQueueActive()
  onActive(job: Job) {
    console.log(
      `Processing job ${job.id} of type ${job.name} with data ${job.data}...`,
    );
  }
}
