import { Processor, Process, OnQueueActive } from '@nestjs/bull';
import { Job } from 'bull';
import { EventBus } from '@nestjs/cqrs';
import { <%= classify(name) %>Service } from '../<%= name %>.service';

@Processor('<%= singular(name) %>-queue')
export class <%= classify(name) %>Consumer {
  constructor(
    private readonly <%= singular(name) %>Service: <%= classify(name) %>Service,
    private eventBus: EventBus,
  ) {}

  @Process('create-<%= singular(name) %>')
  create(job: Job) {
    const { dto } = job.data;
    this.<%= singular(name) %>Service.create(dto, job);
  }

  @Process('update-<%= singular(name) %>')
  update(job: Job) {
    const { dto, id } = job.data;
    this.<%= singular(name) %>Service.update(id, dto, job);
  }

  @Process('remove-<%= singular(name) %>')
  remove(job: Job) {
    this.<%= singular(name) %>Service.remove(job.data.id, job);
  }

  @OnQueueActive()
  onActive(job: Job) {
    console.log(
      `Processing job ${job.id} of type ${job.name} with data ${job.data}...`,
    );
  }
}
