import { toDateInput, toTimeInput } from './dates.js';

const BAD_FILE = "This file isn't a My Expenses backup.";

function csvField(value) {
  const s = String(value ?? '');
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCSV(txns) {
  const rows = [...txns]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map((t) =>
      [toDateInput(t.date), toTimeInput(t.date), t.category, (Number(t.amount) || 0).toFixed(2), t.description]
        .map(csvField)
        .join(','));
  return ['date,time,category,amount,note', ...rows].join('\r\n');
}

export function toBackup(txns, now) {
  return JSON.stringify({ version: 1, exportedAt: now.toISOString(), transactions: txns }, null, 2);
}

function isValidRecord(t) {
  return (
    t !== null &&
    typeof t === 'object' &&
    t.amount !== '' &&
    Number.isFinite(Number(t.amount)) &&
    typeof t.category === 'string' &&
    !Number.isNaN(new Date(t.date).getTime())
  );
}

export function parseBackup(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    return { ok: false, error: BAD_FILE };
  }
  if (!data || data.version !== 1 || !Array.isArray(data.transactions) || !data.transactions.every(isValidRecord)) {
    return { ok: false, error: BAD_FILE };
  }
  return { ok: true, transactions: data.transactions };
}
