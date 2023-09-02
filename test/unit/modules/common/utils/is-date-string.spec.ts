import { isDateString } from '../../../../../src/modules';

describe('isDateString', () => {
  it('should return true for valid ISO8601 date string', () => {
    expect(isDateString('2021-09-09T12:34:56.789Z')).toBeTruthy();
  });

  it('should return false for invalid string', () => {
    expect(isDateString('invalid-string')).toBeFalsy();
  });

  it('should return false for a number', () => {
    expect(isDateString('123456')).toBeFalsy();
  });

  it('should return false for null', () => {
    expect(isDateString(null as any)).toBeFalsy(); // Casting null to 'any' to bypass TypeScript type check
  });

  it('should return false for undefined', () => {
    expect(isDateString(undefined as any)).toBeFalsy(); // Casting undefined to 'any' to bypass TypeScript type check
  });

  it('should return false for empty string', () => {
    expect(isDateString('')).toBeFalsy();
  });

  it('should return false for string that almost looks like a date', () => {
    expect(isDateString('2021-09-09')).toBeFalsy();
  });
});
