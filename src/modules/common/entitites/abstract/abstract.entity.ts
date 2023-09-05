import * as shortUUID from 'short-uuid';

export abstract class AbstractEntity {
  readonly id: string;

  constructor(prefix: string, id: string) {
    this.id = id || `${prefix}_${shortUUID.generate()}`;
  }

  toString(): string {
    return JSON.stringify(this);
  }
}
