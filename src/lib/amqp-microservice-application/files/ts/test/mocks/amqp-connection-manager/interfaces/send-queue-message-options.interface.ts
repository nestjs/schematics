export interface ISendQueueMessageOptions {
  readonly replyTo: string;
  readonly correlationId: string;
}
