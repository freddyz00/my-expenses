import { test } from 'node:test';
import assert from 'node:assert/strict';
import { monthTotal, last7Days, totalsByCategory, groupByDay } from './stats.js';
import { getCategory, CATEGORIES, categoryGroup } from './categories.js';

let n = 0;
const t = (y, m, d, h, amount, category = 'Food') =>
  ({ id: ++n, amount, category, date: new Date(y, m, d, h).toISOString() });

test('getCategory falls back to Others colours, keeping the name', () => {
  const others = CATEGORIES.find((c) => c.name === 'Others');
  const c = getCategory('food');
  assert.equal(c.name, 'food');
  assert.equal(c.color, others.color);
  assert.equal(getCategory('Transport').color, '#0F766E');
});

test('monthTotal handles string amounts and the local month edge', () => {
  const txns = [t(2026, 10, 30, 23, '10.5'), t(2026, 11, 1, 0, 4)];
  assert.equal(monthTotal(txns, 2026, 10), 10.5);
});

test('last7Days returns 7 days, oldest first, today last', () => {
  const now = new Date(2026, 10, 26, 12);
  const days = last7Days([t(2026, 10, 26, 9, 10), t(2026, 10, 20, 9, 5), t(2026, 10, 19, 9, 99)], now);
  assert.equal(days.length, 7);
  assert.deepEqual(days.map((d) => d.total), [5, 0, 0, 0, 0, 0, 10]);
  assert.equal(days[6].key, '2026-11-26');
});

test('totalsByCategory folds unknowns into Others and drops zeros', () => {
  const r = totalsByCategory([t(2026, 10, 1, 9, 10, 'Food'), t(2026, 10, 1, 9, 3, 'food'), t(2026, 10, 1, 9, 2, 'Others')]);
  assert.deepEqual(r.map((x) => [x.name, x.total]), [['Food', 10], ['Others', 5]]);
});

test('groupByDay sorts newest first with day totals', () => {
  const g = groupByDay([t(2026, 10, 25, 9, 4), t(2026, 10, 26, 8, 1), t(2026, 10, 26, 10, 2)]);
  assert.deepEqual(g.map((x) => [x.key, x.total]), [['2026-11-26', 3], ['2026-11-25', 4]]);
  assert.equal(new Date(g[0].items[0].date).getHours(), 10);
});

test('categoryGroup maps unknown categories to Others', () => {
  assert.equal(categoryGroup('Food'), 'Food');
  assert.equal(categoryGroup('food'), 'Others');
  assert.equal(categoryGroup(undefined), 'Others');
});
