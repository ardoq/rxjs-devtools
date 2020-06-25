import { StreamEmission } from './types';

export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  return `${date.getHours()}:${String(date.getMinutes()).padStart(
    2,
    '0'
  )}:${String(date.getSeconds()).padStart(2, '0')}`;
}

export const groupBy = <T>(
  data: T[],
  keyFn: (v: T) => string
): Record<string, T[]> =>
  data.reduce((agg, item) => {
    const key = keyFn(item);
    agg[key] = [...(agg[key] || []), item];
    return agg;
  }, {} as Record<string, T[]>);

export const sortByTimestamp = (a: StreamEmission, b: StreamEmission): number =>
  b.timestamp - a.timestamp;
