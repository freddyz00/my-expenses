import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toCSV, toBackup, parseBackup } from './exporters.js';

test('toCSV quotes tricky notes and lists oldest first', () => {
  const csv = toCSV([
    { amount: 2, category: 'Food', description: 'b', date: new Date(2026, 10, 26, 10, 41).toISOString() },
    { amount: '4.5', category: 'Food', description: 'Kopi, "kaya"\ntoast', date: new Date(2026, 10, 25, 8, 5).toISOString() },
  ]);
  const lines = csv.split('\r\n');
  assert.equal(lines[0], 'date,time,category,amount,note');
  assert.equal(lines[1], '2026-11-25,08:05,Food,4.50,"Kopi, ""kaya""\ntoast"');
  assert.equal(lines[2], '2026-11-26,10:41,Food,2.00,b');
});

test('backup round-trips through parseBackup', () => {
  const txns = [{ id: 1, amount: 3, category: 'Food', description: '', date: new Date().toISOString() }];
  const r = parseBackup(toBackup(txns, new Date()));
  assert.deepEqual(r, { ok: true, transactions: txns });
});

test('parseBackup rejects files that are not backups', () => {
  for (const bad of [
    '',
    'nope',
    '{}',
    '{"version":2,"transactions":[]}',
    '{"version":1,"transactions":[{"amount":"x","category":"Food","date":"2026-01-01"}]}',
    '{"version":1,"transactions":[{"amount":1,"category":"Food","date":"not a date"}]}',
    '{"version":1,"transactions":[null]}',
  ]) {
    const r = parseBackup(bad);
    assert.equal(r.ok, false, bad);
    assert.equal(r.error, "This file isn't a My Expenses backup.");
  }
});

test('parseBackup rejects records with an id IndexedDB cannot store', () => {
  for (const id of ['null', 'true', '{}', '""']) {
    const text = `{"version":1,"transactions":[{"id":${id},"amount":1,"category":"Food","date":"2026-01-01T00:00:00.000Z"}]}`;
    assert.equal(parseBackup(text).ok, false, id);
  }
  const noId = '{"version":1,"transactions":[{"amount":1,"category":"Food","date":"2026-01-01T00:00:00.000Z"}]}';
  assert.equal(parseBackup(noId).ok, true);
});

test('parseBackup rejects a backup with no expenses', () => {
  assert.equal(parseBackup('{"version":1,"transactions":[]}').ok, false);
});
