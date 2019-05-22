import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class MathController {
  @MessagePattern('sum')
  public sum(data: number[]): number {
    return data.reduce((a, b) => a + b);
  }
}
