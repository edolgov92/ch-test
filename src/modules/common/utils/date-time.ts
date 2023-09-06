const DATE_ISO8601: RegExp = /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(\.\d+)?(([+-]\d\d:\d\d)|Z)?$/;

/**
 * Sleeps specified number of milliseconds
 * @param {Number} ms - number or milliseconds to sleep
 */
export function sleep(ms: number): Promise<void> {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

/**
 * Checks if provided string is date string
 * @param {String} value - string to check
 * @returns {Boolean} - boolean that indicates if string is date string
 */
export function isDateString(value: string): boolean {
  if (value === null || value === undefined || typeof value !== 'string') {
    return false;
  }
  return DATE_ISO8601.test(value);
}

/**
 * Convers all date strings inside object to Date instances recursively
 * @param {any} obj - object to check
 * @returns {any} - link to the same object
 */
export function parseObjectDates(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }
  if (typeof obj !== 'object') {
    return obj;
  }
  for (const key of Object.keys(obj)) {
    const value: any = obj[key];
    if (isDateString(value)) {
      obj[key] = new Date(value);
    } else if (typeof value === 'object') {
      parseObjectDates(value);
    }
  }
  return obj;
}
