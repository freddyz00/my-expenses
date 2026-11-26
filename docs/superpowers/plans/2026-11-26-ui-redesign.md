# UI Redesign + Export Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the app's UI around "add an expense and move on" (Home, Activity, Edit sheet, Settings with CSV export and JSON backup/restore), keeping it as simple as possible.

**Architecture:** `App` loads all transactions once into state via a small `useTransactions` hook and passes them down; screens are plain components switched by the existing Radix tabs. All date/money/CSV/backup logic lives in dependency-free modules under `src/lib/` and is unit-tested with Node's built-in test runner. No router, store, or new runtime dependencies.

**Tech Stack:** React 19, Vite 7, Tailwind v4, existing shadcn/Radix pieces (tabs, alert-dialog, button, input), `idb`, `node:test`.

**Spec:** `docs/superpowers/specs/2026-11-26-ui-redesign-design.md` (mockups: https://claude.ai/artifact/CL9trWcQAhj77T5oYejBdY)

## Global Constraints

- No new runtime or dev dependencies. Tests use `node --test` (Node ≥ 20) with `node:assert/strict`.
- `src/lib/*.js` modules must not import React, `@/` aliases, or browser-only APIs at module top level, so Node can run their tests.
- No IndexedDB schema change; records stay `{id, amount, category, description, date, createdAt}`; `date` is an ISO string.
- Categories, fixed in code, in this order: Food `#2563EB`, Shopping `#C2410C`, Transport `#0F766E`, Others `#475569`. Unknown category → Others' colours.
- Money always shown as `$1,284.50` (2 decimals, thousands separator).
- Colours: background `#F6F7F9`, card `#FFFFFF` with 1px `#E3E6EB` border, text `#0F172A`, secondary `#5B6474`, accent `#2563EB`. No gradients, no `backdrop-blur`, no purple.
- System font stack. Touch targets ≥ 44px. Icon-only buttons have `aria-label`.
- Home fast path: bare amount + Add is a complete entry; no dialogs on Home; category defaults to last used (`localStorage` key `lastCategory`, default `Food`).
- Content centred, `max-w-md` on wide screens.
- `npm run lint` already fails on master with 5 pre-existing errors (`CategoryPicker.jsx`, `WeeklyChart.jsx`, `ui/button.jsx`, `tailwind.config.js`, `vite.config.js`). "Lint passes" in this plan means **no errors in files this plan creates or edits**; after Task 6 exactly 3 remain (`ui/button.jsx`, `tailwind.config.js`, `vite.config.js`), which are out of scope.
- Test files import `test` from `node:test` and `assert` from `node:assert/strict` explicitly (no globals).
- All day/month grouping uses the device's **local** date, never the UTC part of the ISO string.

## Review Focus

1. Old records with a category not in the list (e.g. `"food"` or a removed one) → shown with Others' colours and their own name, counted in the summary under Others; never crash. (Task 1 test)
2. Old records whose `amount` is a string (`"12.5"`) → treated as a number everywhere. (Task 1 test)
3. An expense at 23:30 local time on the last day of a month → counted in that month and that day, not the next (UTC drift). (Task 1 test)
4. Restore with a wrong/empty/corrupt file → rejected with a message, existing data untouched. (Task 4 test)
5. CSV notes containing commas, double quotes, or newlines → output still opens as the right columns in a spreadsheet. (Task 4 test)

---

## File Structure

- Create `src/lib/categories.js` — category list + lookup.
- Create `src/lib/format.js` — money formatting, amount input sanitising.
- Create `src/lib/dates.js` — local-date keys, labels, date/time input conversion.
- Create `src/lib/stats.js` — month total, last-7-days, by-category, grouping.
- Create `src/lib/exporters.js` — CSV and backup JSON build/parse.
- Create `src/lib/*.test.js` alongside each.
- Create `src/hooks/useTransactions.js` — load + add/update/remove/replaceAll.
- Create `src/components/Home.jsx`, `Activity.jsx`, `EditSheet.jsx`, `Settings.jsx`, `Toast.jsx`, `CategoryChips.jsx`.
- Modify `src/db/indexedDB.js` — add `replaceAllTransactions`.
- Modify `src/App.jsx` — shell, tabs, bottom nav.
- Modify `package.json` — `"test": "node --test src/lib/"`; remove `recharts`, `@radix-ui/react-select`.
- Delete `src/components/WeeklyChart.jsx`, `TransactionsList.jsx`, `CategoryPicker.jsx`, `ui/chart.jsx`, `ui/select.jsx`.
- Modify `GEMINI.md` feature list.

---

### Task 1: Pure helpers (categories, format, dates, stats)

**Files:**
- Create: `src/lib/categories.js`, `src/lib/format.js`, `src/lib/dates.js`, `src/lib/stats.js`
- Test: `src/lib/format.test.js`, `src/lib/dates.test.js`, `src/lib/stats.test.js`
- Modify: `package.json` (add `test` script)

**Interfaces:**
- Produces:
  - `CATEGORIES: Array<{name: string, color: string, tint: string}>` — tints: Food `#EAF1FE`, Shopping `#FDEEE6`, Transport `#E3F4F1`, Others `#EDF0F4`.
  - `getCategory(name: string) -> {name, color, tint}` — unknown → `{...Others, name}`.
  - `formatMoney(n: number|string) -> string` — `formatMoney(1284.5) === "$1,284.50"`.
  - `sanitizeAmount(raw: string) -> string` — digits and one `.`, max 2 decimals (same rules as today's `formatAmountInput` in `App.jsx:88`).
  - `isValidAmount(s: string) -> boolean` — finite and > 0.
  - `localDayKey(dateLike) -> "YYYY-MM-DD"` (local).
  - `dayLabel(dayKey: string, now: Date) -> string` — `"Today"`, `"Yesterday"`, else `"Wed 25 Nov"`.
  - `toDateInput(iso) -> "YYYY-MM-DD"`, `toTimeInput(iso) -> "HH:MM"` (local).
  - `fromDateTimeInputs(date: string, time: string) -> ISO string` (interprets as local).
  - `withCurrentTime(date: string, now: Date) -> ISO string` — that local day, `now`'s time.
  - `monthTotal(txns, year: number, month: number) -> number` (month 0-11).
  - `inMonth(txns, year, month) -> txns[]`.
  - `last7Days(txns, now: Date) -> Array<{key: string, total: number}>` — length 7, oldest first, last = today.
  - `totalsByCategory(txns) -> Array<{name, color, total}>` — in `CATEGORIES` order, unknowns folded into Others, zero totals omitted.
  - `groupByDay(txns) -> Array<{key, total, items}>` — newest day first, items newest first.

- [ ] **Step 1: Write failing tests**

```js
// src/lib/format.test.js
test('formatMoney pads and separates', () => {
  assert.equal(formatMoney(1284.5), '$1,284.50');
  assert.equal(formatMoney('12.5'), '$12.50');
  assert.equal(formatMoney(0), '$0.00');
});
test('sanitizeAmount', () => {
  assert.equal(sanitizeAmount('$1a2.345'), '12.34');
  assert.equal(sanitizeAmount('1.2.3'), '1.23');
});
test('isValidAmount', () => {
  assert.equal(isValidAmount(''), false);
  assert.equal(isValidAmount('.'), false);
  assert.equal(isValidAmount('0'), false);
  assert.equal(isValidAmount('0.5'), true);
});

// src/lib/dates.test.js  (construct dates with local constructors: new Date(2026, 10, 30, 23, 30))
test('localDayKey uses local date', () => {
  assert.equal(localDayKey(new Date(2026, 10, 30, 23, 30).toISOString()), '2026-11-30');
});
test('dayLabel', () => {
  const now = new Date(2026, 10, 26, 9);
  assert.equal(dayLabel('2026-11-26', now), 'Today');
  assert.equal(dayLabel('2026-11-25', now), 'Yesterday');
  assert.equal(dayLabel('2026-11-18', now), 'Wed 18 Nov');
});
test('date/time inputs round-trip', () => {
  const iso = fromDateTimeInputs('2026-11-26', '10:41');
  assert.equal(toDateInput(iso), '2026-11-26');
  assert.equal(toTimeInput(iso), '10:41');
});
test('withCurrentTime keeps chosen day', () => {
  const iso = withCurrentTime('2026-11-25', new Date(2026, 10, 26, 8, 15));
  assert.equal(toDateInput(iso), '2026-11-25');
  assert.equal(toTimeInput(iso), '08:15');
});

// src/lib/stats.test.js
const t = (y, m, d, h, amount, category = 'Food') =>
  ({ id: Math.random(), amount, category, date: new Date(y, m, d, h).toISOString() });
test('monthTotal: string amounts and local month edge', () => {
  const txns = [t(2026, 10, 30, 23, '10.5'), t(2026, 11, 1, 0, 4)];
  assert.equal(monthTotal(txns, 2026, 10), 10.5);
});
test('last7Days: 7 entries, today last', () => {
  const now = new Date(2026, 10, 26, 12);
  const days = last7Days([t(2026, 10, 26, 9, 10), t(2026, 10, 20, 9, 5), t(2026, 10, 19, 9, 99)], now);
  assert.equal(days.length, 7);
  assert.deepEqual(days.map(d => d.total), [5, 0, 0, 0, 0, 0, 10]);
  assert.equal(days[6].key, '2026-11-26');
});
test('totalsByCategory folds unknowns into Others, drops zeros', () => {
  const r = totalsByCategory([t(2026,10,1,9,10,'Food'), t(2026,10,1,9,3,'food'), t(2026,10,1,9,2,'Others')]);
  assert.deepEqual(r.map(x => [x.name, x.total]), [['Food', 10], ['Others', 5]]);
});
test('groupByDay newest first with totals', () => {
  const g = groupByDay([t(2026,10,25,9,4), t(2026,10,26,8,1), t(2026,10,26,10,2)]);
  assert.deepEqual(g.map(x => [x.key, x.total]), [['2026-11-26', 3], ['2026-11-25', 4]]);
  assert.equal(new Date(g[0].items[0].date).getHours(), 10);
});
```

Also: `getCategory('food')` returns Others' colour with name `'food'` (add to a `categories` assertion in `stats.test.js`).

- [ ] **Step 2: Add `"test": "node --test src/lib/"` to `package.json`; run `npm test`** — Expected: FAIL (modules not found).
- [ ] **Step 3: Implement the four modules** per the Interfaces block. Use `toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})`; build day keys from `getFullYear/getMonth/getDate`; `dayLabel` weekday/month via `toLocaleDateString('en-GB', ...)` assembled as `"Wed 18 Nov"`.
- [ ] **Step 4: Run `npm test`** — Expected: all pass.
- [ ] **Step 5: Commit** — `git add package.json src/lib && git commit -m "feat: add tested date, money and stats helpers"`

---

### Task 2: Shared data hook + DB helper + app shell

**Files:**
- Modify: `src/db/indexedDB.js`, `src/App.jsx`
- Create: `src/hooks/useTransactions.js`, `src/components/Toast.jsx`, `src/components/CategoryChips.jsx`

**Interfaces:**
- Consumes: Task 1 helpers.
- Produces:
  - `replaceAllTransactions(records: object[]) -> Promise<void>` in `indexedDB.js` — one readwrite transaction: `clear()` then `put` each record (keeps ids).
  - `useTransactions() -> {transactions, loading, add(txn) -> Promise<number /*id*/>, update(id, patch) -> Promise<void>, remove(id) -> Promise<void>, replaceAll(records) -> Promise<void>}` — every write updates state after the DB call resolves.
  - `<Toast message: string, actionLabel?: string, onAction?: () => void, onDone: () => void />` — fixed above the nav (`bottom: 92px`), `role="status"`, auto-calls `onDone` after 4000 ms, restarts the timer when `message` changes.
  - `<CategoryChips value: string, onChange: (name) => void />` — `role="radiogroup"` of `CATEGORIES`, each a `role="radio"` button with colour dot; selected = `bg-[#0F172A] text-white`.
  - `App` renders tabs `home | activity | settings` with bottom nav (Home / Activity / Settings, lucide `Home`, `List`, `Settings` icons), always starts on `home`, passes `useTransactions()` result to screens. Until Tasks 3–5 land, each tab may render a placeholder `<p>`.

- [ ] **Step 1: Implement `replaceAllTransactions` and `useTransactions`.**
- [ ] **Step 2: Implement `Toast`, `CategoryChips`, and the new `App` shell** with the Global Constraints colours; remove gradients from `App.jsx`.
- [ ] **Step 3: Verify** — `npm run lint` and `npm run build` succeed; start the dev server, at 375×812 the three tabs switch and the nav highlights the active tab.
- [ ] **Step 4: Commit** — `git commit -am "feat: shared transactions hook and new app shell"` (add new files first).

---

### Task 3: Home screen (the fast path)

**Files:**
- Create: `src/components/Home.jsx`
- Modify: `src/App.jsx` (render `Home` in the `home` tab)

**Interfaces:**
- Consumes: `useTransactions` result (`transactions`, `add`, `remove`), `Toast`, `CategoryChips`, Task 1 helpers.
- Produces: `<Home transactions add remove onSeeAll: () => void />`.

Behaviour (from spec "Home"; copy exact):
- Header: `Spent in {MonthName}` + `formatMoney(monthTotal)`; line `Today {x} · 7 days {y}` (7 days = sum of `last7Days`); 7 bars (height ∝ total, min 4px, today `#2563EB`, others `#C9D7F8`), wrapped in `role="img" aria-label="Spending over the last 7 days"`.
- Add card, fixed height: amount input (`inputMode="decimal"`, `sanitizeAmount` on change, `autoFocus`), date button showing `Today` or `dayLabel` of the chosen day that opens a visually hidden native `<input type="date" max={today}>` (use `showPicker()` when available, else focus/click), presets `$5 $10 $20` (fill amount only), `CategoryChips`, note input (always rendered), `Add expense` button disabled unless `isValidAmount`.
- Enter in amount or note submits when valid.
- Submit: `add({amount: Number(amount), category, description: note.trim(), date: withCurrentTime(chosenDay, new Date())})`; save `localStorage.lastCategory = category` (wrap in try/catch); reset amount/note/date to today; keep category; refocus amount; show Toast `Added {formatMoney} to {category}` with `Undo` → `remove(id)`.
- Initial category: `localStorage.lastCategory` if it is in `CATEGORIES`, else `Food` (try/catch).
- `Recent`: 3 newest transactions (title = note or category; meta = `{category} · {dayLabel}, {time}`), `See all` button calls `onSeeAll`.

- [ ] **Step 1: Implement `Home.jsx` and wire it in `App`** (`onSeeAll` → `setActiveTab('activity')`).
- [ ] **Step 2: Verify in the browser at 375×812:** type `12.5`, Enter → row appears in Recent, toast shows `Added $12.50 to Food`, amount field empty and focused; tap Undo → row gone; pick Shopping, add, reload → Shopping still selected; pick yesterday via date button, add → Recent shows `Yesterday`; layout does not shift while typing; no console errors.
- [ ] **Step 3: `npm run lint && npm run build`** — pass.
- [ ] **Step 4: Commit** — `git add src && git commit -m "feat: redesigned Home with fast add and undo"`

---

### Task 4: Activity screen + Edit sheet

**Files:**
- Create: `src/components/Activity.jsx`, `src/components/EditSheet.jsx`
- Modify: `src/App.jsx`

**Interfaces:**
- Consumes: `transactions`, `update`, `remove`, `CategoryChips`, Task 1 helpers.
- Produces: `<Activity transactions update remove />`, `<EditSheet transaction: object|null, onSave: (patch) => void, onDelete: () => void, onClose: () => void />`.

Behaviour:
- Activity: month state `{year, month}` starting at current month; `‹` / `›` buttons (`aria-label` "Previous month"/"Next month"), `›` disabled on the current month; title `November 2026`.
- Summary card: `formatMoney(total)`, `{n} expenses` (`1 expense` singular), stacked bar from `totalsByCategory` (`role="img"`, `aria-label` like `Food 48%, Shopping 31%`), 2×2 legend with amounts.
- Filter chips `All` + categories (filter by `getCategory(t.category).name === chip`; unknowns fall under Others).
- List from `groupByDay` of the filtered month: each day header shows `dayLabel(key, now)` on the left and `formatMoney(total)` on the right; rows are `<button>`s (colour dot, note or category name, `{category} · {time}`, amount) opening the sheet.
- Empty: `No expenses in {MonthName}`.
- EditSheet: Radix `AlertDialog` content restyled as bottom sheet (`fixed bottom-0 inset-x-0 rounded-t-3xl`); fields amount (`sanitizeAmount`), `CategoryChips`, `<input type="date">`, `<input type="time">`, note; `Save changes` calls `onSave({amount: Number, category, description, date: fromDateTimeInputs(d, t)})`, disabled unless `isValidAmount`; `Delete expense` switches the sheet to an inline confirm (`Delete this expense?` + `Delete` / `Cancel`) then `onDelete`; ✕ (`aria-label="Close"`), Escape and backdrop tap call `onClose`.

- [ ] **Step 1: Implement both components and wire Activity into `App`.**
- [ ] **Step 2: Verify in the browser:** seed via the UI an expense, then in DevTools add one record with `category: "food"` and `amount: "3"` to IndexedDB → Activity shows it under Others in summary, row shows `food`, no crash; edit an expense's date to last month → it moves to that month when navigating `‹`; delete asks once then removes; empty month shows the message.
- [ ] **Step 3: `npm run lint && npm run build`** — pass.
- [ ] **Step 4: Commit** — `git add src && git commit -m "feat: Activity screen with month summary and edit sheet"`

---

### Task 5: Settings — CSV export, JSON backup, restore

**Files:**
- Create: `src/lib/exporters.js`, `src/lib/exporters.test.js`, `src/components/Settings.jsx`
- Modify: `src/App.jsx`

**Interfaces:**
- Consumes: `transactions`, `replaceAll`, Task 1 `toDateInput`, `toTimeInput`.
- Produces:
  - `toCSV(txns) -> string` — header `date,time,category,amount,note`; rows oldest first; amount with 2 decimals; any field containing `,` `"` or newline is wrapped in quotes with `"` doubled; lines joined with `\r\n`.
  - `toBackup(txns, now: Date) -> string` — `JSON.stringify({version: 1, exportedAt: now.toISOString(), transactions: txns}, null, 2)`.
  - `parseBackup(text: string) -> {ok: true, transactions} | {ok: false, error: string}` — requires `version === 1` and an array whose items each have finite numeric-ish `amount`, string `category`, valid date `date`; error message `This file isn't a My Expenses backup.`
  - `downloadFile(filename, text, mime)` — in `Settings.jsx` (browser-only; Blob + temporary `<a download>`).

- [ ] **Step 1: Write failing tests**

```js
test('toCSV quotes tricky notes, oldest first', () => {
  const csv = toCSV([
    { amount: 2, category: 'Food', description: 'b', date: new Date(2026,10,26,10,41).toISOString() },
    { amount: '4.5', category: 'Food', description: 'Kopi, "kaya"\ntoast', date: new Date(2026,10,25,8,5).toISOString() },
  ]);
  const lines = csv.split('\r\n');
  assert.equal(lines[0], 'date,time,category,amount,note');
  assert.equal(lines[1], '2026-11-25,08:05,Food,4.50,"Kopi, ""kaya""\ntoast"');
  assert.equal(lines[2], '2026-11-26,10:41,Food,2.00,b');
});
test('backup round-trips', () => {
  const txns = [{ id: 1, amount: 3, category: 'Food', description: '', date: new Date().toISOString() }];
  const r = parseBackup(toBackup(txns, new Date()));
  assert.deepEqual(r, { ok: true, transactions: txns });
});
test('parseBackup rejects bad input', () => {
  for (const bad of ['', 'nope', '{}', '{"version":2,"transactions":[]}',
                     '{"version":1,"transactions":[{"amount":"x","category":"Food","date":"2026-01-01"}]}']) {
    assert.equal(parseBackup(bad).ok, false);
  }
});
```

(The CSV `split('\r\n')` keeps the embedded `\n` inside line 1 — that is intended.)

- [ ] **Step 2: Run `npm test`** — Expected: FAIL (module not found).
- [ ] **Step 3: Implement `exporters.js`.**
- [ ] **Step 4: Run `npm test`** — Expected: all pass.
- [ ] **Step 5: Implement `Settings.jsx`** — section `Your data` with three rows (copy from spec: `Export as CSV` / `Opens in Excel, Numbers or Google Sheets`; `Back up as JSON` / `Full backup you can restore later`; `Restore from backup` / `Import a JSON backup file`). Filenames `expenses-YYYY-MM-DD.csv` and `expenses-backup-YYYY-MM-DD.json` (local date). Restore: hidden `<input type="file" accept="application/json,.json">`; on parse error show the error text inline; on success `window.confirm("Replace all {N} expenses with {M} from this backup?")` → `replaceAll`. Export buttons disabled with `No expenses yet` hint when empty. Wire into `App`.
- [ ] **Step 6: Verify in the browser:** export CSV and open the file's text — header and rows correct; back up JSON, delete an expense, restore → it returns; restore a random `.json` → error shown, data unchanged.
- [ ] **Step 7: `npm run lint && npm run build`** — pass.
- [ ] **Step 8: Commit** — `git add src && git commit -m "feat: CSV export and JSON backup/restore in Settings"`

---

### Task 6: Remove dead code and update docs

**Files:**
- Delete: `src/components/WeeklyChart.jsx`, `src/components/TransactionsList.jsx`, `src/components/CategoryPicker.jsx`, `src/components/ui/chart.jsx`, `src/components/ui/select.jsx`, `src/App.css` (empty) if unreferenced
- Modify: `package.json` / `package-lock.json` (`npm uninstall recharts @radix-ui/react-select`), `GEMINI.md`

- [ ] **Step 1: Confirm nothing imports them** — `grep -rn "WeeklyChart\|TransactionsList\|CategoryPicker\|ui/chart\|ui/select\|recharts\|App.css" src` → no matches outside the files being deleted.
- [ ] **Step 2: Delete files and uninstall the two packages.**
- [ ] **Step 3: Update GEMINI.md** — Current Features: Home fast add (last category remembered, undo), Activity month view with category summary and edit sheet, Settings export CSV / JSON backup & restore; remove "Recharts" from stack and the non-existent `pages/`, `styles/`, `categories` store; state "no service worker yet".
- [ ] **Step 4: Verify** — `npm test` and `npm run build` pass; `npm run lint` shows only the 3 out-of-scope errors; quick click-through of all three tabs at 375×812 with no console errors.
- [ ] **Step 5: Commit** — `git add -A src package.json package-lock.json GEMINI.md && git commit -m "chore: remove unused chart/select code, update project notes"`
