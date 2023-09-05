export abstract class AbstractDto<T extends AbstractDto = any> {
  constructor(data: T) {
    Object.assign(this, data);
  }

  toString(): string {
    return JSON.stringify(this);
  }
}
