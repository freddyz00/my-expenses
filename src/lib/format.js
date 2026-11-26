export function formatMoney(n) {
  const value = Number(n) || 0;
  return '$' + value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function sanitizeAmount(raw) {
  const digits = String(raw).replace(/[^0-9.]/g, '');
  const [whole, ...rest] = digits.split('.');
  if (rest.length === 0) return whole;
  return whole + '.' + rest.join('').slice(0, 2);
}

export function isValidAmount(s) {
  const n = Number(s);
  return s !== '' && Number.isFinite(n) && n > 0;
}
