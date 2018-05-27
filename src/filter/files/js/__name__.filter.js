import { Catch } from '@nestjs/common';

@Catch()
export class <%= classify(name) %>Filter {
  catch(exception, host) {}
}
