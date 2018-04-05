import { Path } from '@angular-devkit/core';

export interface GatewayOptions {
  /**
   * The name of the gateway.
   */
  name: string;
  /**
   * The path to create the gateway.
   */
  path?: string | Path;
}
