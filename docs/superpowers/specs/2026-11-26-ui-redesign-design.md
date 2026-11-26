# My Expenses — UI redesign + export

Date: 2026-11-26
Mockups: [My Expenses Redesign canvas](https://claude.ai/artifact/CL9trWcQAhj77T5oYejBdY) (Home, Activity, Edit expense, Settings)

## Why

A personal, phone-first expense log. Logging an expense should take a few seconds, and the data should never be trapped in one browser. Trying the current app showed small frictions (no feedback after Add, rounded totals, layout jumping, no way to set a date, hidden swipe actions, no month total) and no way to get data out.

**Guiding rules**
1. **Add and move on.** The main job is: open the app, type an amount, tap Add, close the app. That path must take no extra taps, no dialogs, no required fields beyond the amount, and nothing that makes the user wait or decide. Everything else (Activity, Edit, Settings) is secondary and must never get in the way of it.
2. **Keep the app as simple as possible.** Every item below either removes friction or protects data. Anything else is out.

## Goals

1. Faster, clearer logging on Home.
2. See and fix past expenses easily (Activity + Edit).
3. Get data out and back in (CSV export, JSON backup/restore).
4. Calmer look: black, white, one blue accent. No gradients.

## Non-goals (explicitly cut to stay simple)

- Cloud sync. Not decided yet; Settings shows nothing for it until it is.
- Custom categories and editable quick amounts (the "+" chip and "Customise" section in the mockups are **not** built).
- Search. Month + category filter is enough for now.
- Budgets, charts beyond the sparkline and category bar, multiple currencies.
- Service worker / offline caching (separate task).
- Routing library, state library, toast library, new dependencies.

## Approaches considered

- **A. Restyle in place, lift shared state into `App` (chosen).** Keep React + Tailwind + existing shadcn pieces, keep tabs for navigation, hold the transaction list in `App` and pass it down. Fewest moving parts; also fixes the two tabs loading data separately.
- B. Add a router and a store (e.g. React Router + Zustand). More structure than a three-screen app needs.
- C. Rewrite on a new UI kit. Churn without user benefit.

## Design

### Data
- No IndexedDB schema change. Records stay `{id, amount, category, description, date, createdAt}`.
- Categories stay a fixed list in code: **Food, Shopping, Transport, Others** (Transport is new). Each has one colour (Food `#2563EB`, Shopping `#C2410C`, Transport `#0F766E`, Others `#475569`) and a light tint for row icons. Unknown categories (old data) fall back to Others' colour.
- `App` loads all transactions once, holds them in state, and passes them plus `add / update / remove` helpers to the screens. Every write updates state immediately.
- All money is shown with 2 decimals (`$52.50`), thousands separated.

### Navigation
Bottom bar with three tabs: **Home, Activity, Settings**. Active tab in blue.

### Home
- Top: "Spent in {Month}" + month total; below, "Today $x · 7 days $y" (7 days = today and the 6 days before, calendar days, same as the sparkline). Right side: 7 thin bars for the last 7 days, today's bar in blue. Plain divs, no chart library.
- Add card, fixed height (nothing appears/disappears):
  - Amount input (large, decimal keypad, max 2 decimals) and a **date button** showing "Today"; tapping it opens a native date input. Time is the current time.
  - Quick amounts $5 / $10 / $20 (fixed).
  - Category chips (selected = black fill).
  - Note input, always visible. Enter in amount or note submits.
  - **Add expense** button, disabled until amount > 0.
- Fast path defaults, so a bare amount + Add is a complete entry:
  - Category defaults to the **last one used** (remembered across app launches in `localStorage`; Food on first run).
  - Date defaults to today; note is optional.
  - The app always opens on Home. The amount field is focused on load where the browser allows it (desktop; iOS won't open the keyboard without a tap, which is fine).
  - Tapping a quick amount ($5/$10/$20) fills the amount only; the user still taps Add (no accidental entries).
- After adding: amount, note and date reset (category stays), the amount field stays ready for another entry, and a small bar at the bottom says "Added $42.50 to Shopping" with **Undo** (deletes it). It auto-hides after ~4 s and never blocks the screen or needs dismissing.
- No confirmation dialogs anywhere on Home.
- **Recent**: last 3 expenses, "See all" switches to Activity.

### Activity
- Month header with ‹ › arrows (› disabled on the current month). Replaces the month/year dropdowns.
- Summary card: month total, expense count, one stacked bar by category, and a 2×2 legend with amounts. Categories with $0 are hidden.
- Category filter chips: All + each category.
- List grouped by day ("Today", "Yesterday", else "Wed 25 Nov"), day total on the header, newest first. Each row: colour dot, note (or category name if no note), category · time, amount.
- Tap a row → Edit sheet. Swipe-to-reveal is removed.
- Empty month: short message, "No expenses in {Month}".

### Edit expense (bottom sheet)
- Fields: amount, category chips, date, time (native inputs), note.
- **Save changes** (black) and **Delete expense** (red text). Delete asks once ("Delete this expense?") before removing.
- Close via ✕ or tapping the backdrop.

### Settings
- **Your data**
  - **Export as CSV** — downloads `expenses-YYYY-MM-DD.csv`, columns `date,time,category,amount,note`, all expenses, oldest first, values quoted where needed.
  - **Back up as JSON** — downloads `expenses-backup-YYYY-MM-DD.json` containing `{version: 1, exportedAt, transactions: [...]}`.
  - **Restore from backup** — pick a JSON file from the step above; show "Replace all N expenses with M from this backup?"; on confirm, clear the store and write the backup's records. Reject files that don't match the shape with a short message.
- Nothing else on this screen for now.

### Look
- Background `#F6F7F9`, cards white with 1px `#E3E6EB` border, text `#0F172A`, secondary text `#5B6474`, accent `#2563EB`.
- System font stack (no web font download).
- Touch targets ≥ 44px; icon-only buttons get `aria-label`.
- Remove the gradients, `backdrop-blur`, and the purple accents.

## Constraints

- Offline-first, no backend (per GEMINI.md).
- Keep current data readable: no migration, no breaking changes to records.
- Phone-first (≈390px wide); must not break on desktop (content stays centred, max ~448px).

## Left to the builder

- Component split and file names (e.g. `Home`, `Activity`, `EditSheet`, `Settings`, a tiny `Toast`).
- Whether to reuse the existing Radix alert-dialog for the sheet or a plain fixed-position panel.
- Removing now-unused code and dependencies (`WeeklyChart`, `recharts`, `ui/chart`, `ui/select`) if nothing else uses them.
- Updating GEMINI.md's feature list to match.
