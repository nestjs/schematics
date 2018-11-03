import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';

@Catch()
export class <%= classify(name) %>Filter<T> implements ExceptionFilter {
  catch(exception: T, host: ArgumentsHost) {}
}
