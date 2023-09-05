import { cloneJson } from '../../../../../src/modules';

describe('cloneJson function', () => {
  it('should return null when input is null', () => {
    expect(cloneJson(null)).toBeNull();
  });

  it('should return the same number when input is a number', () => {
    expect(cloneJson(5)).toBe(5);
  });

  it('should return a new array when input is an array', () => {
    const arr: number[] = [1, 2, 3];
    const clonedArr = cloneJson(arr);
    expect(clonedArr).toEqual(arr);
    expect(clonedArr).not.toBe(arr);
  });

  it('should return a new object when input is an object', () => {
    const obj = { a: 1, b: 2 };
    const clonedObj = cloneJson(obj);
    expect(clonedObj).toEqual(obj);
    expect(clonedObj).not.toBe(obj);
  });

  it('should keep Date objects', () => {
    const obj = { date: new Date('2022-08-30T12:34:56.000Z') };
    const clonedObj = cloneJson(obj);
    expect(clonedObj.date).toBeInstanceOf(Date);
    expect(clonedObj.date.getTime()).toBe(obj.date.getTime());
  });

  it('should clone nested objects', () => {
    const obj = { a: 1, nested: { b: 2 } };
    const clonedObj = cloneJson(obj);
    expect(clonedObj.nested).toEqual(obj.nested);
    expect(clonedObj.nested).not.toBe(obj.nested);
  });

  it('should clone nested arrays', () => {
    const obj = { a: 1, nestedArr: [1, 2, 3] };
    const clonedObj = cloneJson(obj);
    expect(clonedObj.nestedArr).toEqual(obj.nestedArr);
    expect(clonedObj.nestedArr).not.toBe(obj.nestedArr);
  });

  it('should handle special characters', () => {
    const obj = { a: 'a&b<c>d;e"f' };
    const clonedObj = cloneJson(obj);
    expect(clonedObj).toEqual(obj);
  });
});
