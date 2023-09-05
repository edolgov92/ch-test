import { parseObjectDates } from '../../../../../src/modules';

describe('parseObjectDates', () => {
  it('should return null for null input', () => {
    expect(parseObjectDates(null)).toBeNull();
  });

  it('should return undefined for undefined input', () => {
    expect(parseObjectDates(undefined)).toBeUndefined();
  });

  it('should return primitive types as is', () => {
    expect(parseObjectDates(123)).toEqual(123);
    expect(parseObjectDates('string')).toEqual('string');
    expect(parseObjectDates(true)).toEqual(true);
  });

  it('should convert date strings to Date objects', () => {
    const obj = { date: '2021-09-09T12:34:56.789Z' };
    const parsedObj = parseObjectDates(obj);
    expect(parsedObj.date).toBeInstanceOf(Date);
  });

  it('should not alter non-date strings', () => {
    const obj = { key: 'value' };
    const parsedObj = parseObjectDates(obj);
    expect(parsedObj.key).toBe('value');
  });

  it('should handle nested objects', () => {
    const obj = { outer: { inner: '2021-09-09T12:34:56.789Z' } };
    const parsedObj = parseObjectDates(obj);
    expect(parsedObj.outer.inner).toBeInstanceOf(Date);
  });

  it('should handle arrays', () => {
    const obj = { dates: ['2021-09-09T12:34:56.789Z'] };
    const parsedObj = parseObjectDates(obj);
    expect(parsedObj.dates[0]).toBeInstanceOf(Date);
  });
});
