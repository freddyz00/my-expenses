import { test } from 'node:test';
import assert from 'node:assert/strict';
import { localDayKey, dayLabel, toDateInput, toTimeInput, fromDateTimeInputs, withCurrentTime } from './dates.js';

test('localDayKey uses the local date, not UTC', () => {
  assert.equal(localDayKey(new Date(2026, 10, 30, 23, 30).toISOString()), '2026-11-30');
});

test('dayLabel says Today, Yesterday, else weekday day month', () => {
  const now = new Date(2026, 10, 26, 9);
  assert.equal(dayLabel('2026-11-26', now), 'Today');
  assert.equal(dayLabel('2026-11-25', now), 'Yesterday');
  assert.equal(dayLabel('2026-11-18', now), 'Wed 18 Nov');
});

test('date/time inputs round-trip through ISO', () => {
  const iso = fromDateTimeInputs('2026-11-26', '10:41');
  assert.equal(toDateInput(iso), '2026-11-26');
  assert.equal(toTimeInput(iso), '10:41');
});

test('withCurrentTime keeps the chosen day with the current time', () => {
  const iso = withCurrentTime('2026-11-25', new Date(2026, 10, 26, 8, 15));
  assert.equal(toDateInput(iso), '2026-11-25');
  assert.equal(toTimeInput(iso), '08:15');
});
