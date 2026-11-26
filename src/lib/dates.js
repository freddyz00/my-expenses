const pad = (n) => String(n).padStart(2, '0');

export function localDayKey(dateLike) {
  const d = new Date(dateLike);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function keyToDate(key) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function dayLabel(dayKey, now) {
  if (dayKey === localDayKey(now)) return 'Today';
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  if (dayKey === localDayKey(yesterday)) return 'Yesterday';
  const d = keyToDate(dayKey);
  const weekday = d.toLocaleDateString('en-GB', { weekday: 'short' });
  const month = d.toLocaleDateString('en-GB', { month: 'short' });
  const year = d.getFullYear() !== now.getFullYear() ? ` ${d.getFullYear()}` : '';
  return `${weekday} ${d.getDate()} ${month}${year}`;
}

export function toDateInput(iso) {
  return localDayKey(iso);
}

export function toTimeInput(iso) {
  const d = new Date(iso);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function fromDateTimeInputs(date, time) {
  const [y, m, d] = date.split('-').map(Number);
  const [hh, mm] = (time || '00:00').split(':').map(Number);
  return new Date(y, m - 1, d, hh, mm).toISOString();
}

export function withCurrentTime(date, now) {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(y, m - 1, d, now.getHours(), now.getMinutes(), now.getSeconds()).toISOString();
}
