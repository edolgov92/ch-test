import { sleep } from '../../../../../src/modules';

jest.useFakeTimers();

describe('sleep function', () => {
  it('should resolve after specified milliseconds', () => {
    const callback = jest.fn();
    sleep(3000).then(callback);
    expect(callback).not.toBeCalled();
    jest.runAllTimers();
    return Promise.resolve().then(() => expect(callback).toBeCalled());
  });

  it('should not resolve before specified milliseconds', () => {
    const callback = jest.fn();
    sleep(3000).then(callback);
    expect(callback).not.toBeCalled();
    jest.advanceTimersByTime(1500);
    expect(callback).not.toBeCalled();
  });

  it('should resolve exactly after specified milliseconds', () => {
    const callback = jest.fn();
    sleep(3000).then(callback);
    jest.advanceTimersByTime(3000);
    return Promise.resolve().then(() => expect(callback).toBeCalled());
  });
});
