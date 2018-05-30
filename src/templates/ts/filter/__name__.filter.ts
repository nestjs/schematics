import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';

@Catch()
export class <%= classify(name) %>Filter implements ExceptionFilter {
  catch(exception, host: ArgumentsHost) {}
}
