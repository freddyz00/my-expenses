import { CATEGORIES, getCategory, categoryGroup } from './categories.js';
import { localDayKey } from './dates.js';

const sum = (txns) => txns.reduce((s, t) => s + (Number(t.amount) || 0), 0);

export function inMonth(txns, year, month) {
  return txns.filter((t) => {
    const d = new Date(t.date);
    return d.getFullYear() === year && d.getMonth() === month;
  });
}

export function monthTotal(txns, year, month) {
  return sum(inMonth(txns, year, month));
}

export function last7Days(txns, now) {
  const days = Array.from({ length: 7 }, (_, i) =>
    localDayKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() - (6 - i))));
  const totals = Object.fromEntries(days.map((k) => [k, 0]));
  for (const t of txns) {
    const k = localDayKey(t.date);
    if (k in totals) totals[k] += Number(t.amount) || 0;
  }
  return days.map((key) => ({ key, total: totals[key] }));
}

export function totalsByCategory(txns) {
  const totals = Object.fromEntries(CATEGORIES.map((c) => [c.name, 0]));
  for (const t of txns) {
    const name = categoryGroup(t.category);
    totals[name] += Number(t.amount) || 0;
  }
  return CATEGORIES.filter((c) => totals[c.name] > 0)
    .map((c) => ({ name: c.name, color: getCategory(c.name).color, total: totals[c.name] }));
}

export function groupByDay(txns) {
  const sorted = [...txns].sort((a, b) => new Date(b.date) - new Date(a.date));
  const groups = [];
  for (const t of sorted) {
    const key = localDayKey(t.date);
    let g = groups[groups.length - 1];
    if (!g || g.key !== key) groups.push((g = { key, total: 0, items: [] }));
    g.items.push(t);
    g.total += Number(t.amount) || 0;
  }
  return groups;
}
