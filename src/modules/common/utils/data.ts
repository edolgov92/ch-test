import { parseObjectDates } from './date-time';

export function cloneJson<T = any>(data: T): T {
  const newData: T = JSON.parse(JSON.stringify(data));
  parseObjectDates(newData);
  return newData;
}
