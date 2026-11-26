# 📌 Project Context — Expense Tracker PWA

## Overview

This project is a **Progressive Web App (PWA)** expense tracker designed for **personal use**.  
It is **minimal, clean, and sleek** in design, using **black, white, and a neutral blue** as the main color palette.  
The app works offline, supports installation to mobile home screens, and persists data locally.

---

## Tech Stack

- **React + Vite** → Frontend framework and build tool.
- **Tailwind CSS** → Utility-first CSS styling.
- **shadcn/ui** → Modern component library for consistent UI.
- **IndexedDB (`idb` library)** → Local data persistence across sessions.
- **PWA Manifest** → Installable to the home screen. (No service worker yet, so it does not work offline.)
- **Tests** → `npm test` runs `node:test` over `src/lib/` (no test dependencies).

---

## Current Features

Guiding rule: **add an expense and move on**. Keep the app as simple as possible.

1. **Home**: month total, today / 7-day totals, 7-day bars, and a quick-add form (amount, $5/$10/$20 presets, category, optional note, date button). Last category is remembered; after adding, an "Added… / Undo" message shows.
2. **Activity**: month-by-month view with a category breakdown, category filter, and expenses grouped by day. Tap an expense to edit amount, category, date, time or note, or delete it.
3. **Settings**: export as CSV, back up as JSON, restore from a JSON backup (replaces all expenses after confirming).
4. **Fixed categories** in `src/lib/categories.js`: Food, Shopping, Transport, Others. Unknown categories in old data are grouped under Others.
5. **Persistent Storage** in IndexedDB (`src/db/indexedDB.js`); `src/hooks/useTransactions.js` loads it once and shares it across screens.
6. **Styling**: black/white with one blue accent (`#2563EB`), system font, no gradients.

---

## Planned / Not Yet

- Cloud sync (not decided yet).
- Service worker for offline use.

---

## Folder Structure

src/
components/ # React UI components
db/ # IndexedDB wrapper functions
hooks/ # useTransactions (shared expense state)
lib/ # Pure, tested helpers: categories, format, dates, stats, exporters
public/
icons/ # PWA icons (192px, 512px, etc.)
manifest.json # PWA configuration

---

## Key Implementation Notes

- **IndexedDB** via `idb`:
  - Store name: `expense_tracker`
  - Object store: `transactions`
  - All CRUD handled in `src/db/indexedDB.js`
- **shadcn/ui** is installed:
  - Components like `<Input>`, `<Button>`, `<Card>` replace native HTML elements.
  - Uses Tailwind for styling and theming.
- **Manifest.json** defines:
  - `name`, `short_name`, `icons`, and theme colors for installable app.

---

## Development Guidelines for LLMs / Coding Agents

- Keep UI consistent with black/white + neutral blue palette.
- Use shadcn/ui components for all form elements, buttons, and cards.
- Store all persistent data in IndexedDB via src/db/indexedDB.js.
- Do not introduce backend dependencies — app is offline-first.
- Keep charts as plain divs; don't add a chart library.
- When adding new features, ensure PWA compliance (manifest + icons).
