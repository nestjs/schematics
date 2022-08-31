import { Injectable } from '@nestjs/common';
import { Saga, ICommand, ofType } from '@nestjs/cqrs';
import { Observable, map } from 'rxjs';
import { <%= singular(classify(name)) %>CreatedEvent } from './events/<%= singular(name) %>-created.event';
import { Remove<%= singular(classify(name)) %>Command } from './commands/remove-<%= singular(name) %>.command';

const oneMinute = 1 * 60 * 1000;

@Injectable()
export class <%= singular(classify(name)) %>Sagas {
  @Saga()
  cleanup = (events$: Observable<any>): Observable<ICommand> => {
    return events$.pipe(
      ofType(<%= singular(classify(name)) %>CreatedEvent),
      map((event) => {
        console.log('<%= singular(name) %> cleanup saga started...');
        return new Remove<%= singular(classify(name)) %>Command(event.<%= singular(name) %>Id, oneMinute);
      }),
    );
  };
}
