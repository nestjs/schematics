import { Processor, Process, OnQueueActive } from '@nestjs/bull';
import { Job } from 'bull';
import { <%= classify(name) %>CreatedEvent } from '../events/<%= singular(name) %>-created.event';
import { <%= classify(name) %>UpdatedEvent } from '../events/<%= singular(name) %>-updated.event';
import { <%= classify(name) %>RemovedEvent } from '../events/<%= singular(name) %>-removed.event';
import { EventBus } from '@nestjs/cqrs';
import { <%= classify(name) %>Service } from '../<%= singular(name) %>.service';

@Processor('<%= singular(name) %>-queue')
export class <%= classify(name) %>Consumer {
  constructor(
    private readonly <%= singular(name) %>Service: <%= classify(name) %>Service,
    private eventBus: EventBus,
  ) {}

  @Process('create-<%= singular(name) %>')
  async create(job: Job) {
    const { dto } = job.data;
    const created = await this.<%= singular(name) %>Service.create(create<%= classify(name) %>Dto, files);
    if (created) {
      job.update({ id: created.id });
      await job.progress(100);
      this.eventBus.publish(new <%= classify(name) %>CreatedEvent(created.id));
    }
  }

  @Process('update-<%= singular(name) %>')
  async update(job: Job) {
    const { dto, id } = job.data;
    const updated = await this.<%= singular(name) %>Service.update(id, update<%= classify(name) %>Dto);
    if (updated) {
      job.update({ id: updated.id });
      await job.progress(100);
      this.eventBus.publish(new <%= classify(name) %>UpdatedEvent(created.id));
    }
  }

  @Process('remove-<%= singular(name) %>')
  async remove(job: Job) {
    const removed = this.<%= singular(name) %>Service.remove(job.data.<%= singular(name) %>Id);
    if (removed) {
      await job.progress(100);
      this.eventBus.publish(new <%= classify(name) %>RemovedEvent(removed.id));
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
