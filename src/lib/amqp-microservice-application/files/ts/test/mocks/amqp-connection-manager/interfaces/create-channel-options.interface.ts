import { Channel } from '../amqp.channel';

export interface ICreateChannelOptions {
  readonly json: boolean;
  setup(channel: Channel): any;
}
