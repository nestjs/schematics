import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class MathController {
  @MessagePattern({ cmd: 'sum' })
  sum(data) {
    return (data || []).reduce((a, b) => a + b);
  }
}
