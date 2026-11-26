import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatMoney, sanitizeAmount, isValidAmount } from './format.js';

test('formatMoney pads and separates', () => {
  assert.equal(formatMoney(1284.5), '$1,284.50');
  assert.equal(formatMoney('12.5'), '$12.50');
  assert.equal(formatMoney(0), '$0.00');
});

test('sanitizeAmount keeps digits, one dot, two decimals', () => {
  assert.equal(sanitizeAmount('$1a2.345'), '12.34');
  assert.equal(sanitizeAmount('1.2.3'), '1.23');
});

test('isValidAmount requires a positive number', () => {
  assert.equal(isValidAmount(''), false);
  assert.equal(isValidAmount('.'), false);
  assert.equal(isValidAmount('0'), false);
  assert.equal(isValidAmount('0.5'), true);
});
