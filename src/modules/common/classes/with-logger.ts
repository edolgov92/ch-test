import { Logger } from '@nestjs/common';

export abstract class WithLogger {
  protected logger: Logger;

  constructor() {
    this.logger = new Logger(this.constructor.name);
  }
}
