import type { ActivityDay, Language } from "../schemas/analytics.ts";

export function aggregateLanguages(results: Record<string, number>[]): Language[] {
  const totals = new Map<string, number>();
  for (const result of results) for (const [name, bytes] of Object.entries(result)) totals.set(name, (totals.get(name) ?? 0) + bytes);
  const total = [...totals.values()].reduce((sum, bytes) => sum + bytes, 0);
  if (!total) return [];
  const sorted = [...totals].sort((first, second) => second[1] - first[1]);
  const top = sorted.slice(0, 6).map(([name, bytes]) => ({ name, bytes, share: bytes / total * 100 }));
  const other = sorted.slice(6).reduce((sum, [, bytes]) => sum + bytes, 0);
  return other ? [...top, { name: "Other", bytes: other, share: other / total * 100 }] : top;
}

export function weeklyActivity(days: ActivityDay[]) {
  const weeks = new Map<string, number>();
  for (const day of days) {
    const date = new Date(`${day.date}T00:00:00Z`);
    date.setUTCDate(date.getUTCDate() - date.getUTCDay());
    const key = date.toISOString().slice(0, 10);
    weeks.set(key, (weeks.get(key) ?? 0) + day.count);
  }
  return [...weeks].sort(([first], [second]) => first.localeCompare(second)).map(([date, count]) => ({ date, count }));
}