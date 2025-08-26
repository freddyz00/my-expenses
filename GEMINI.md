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
- **PWA Manifest + Service Worker** → Installable and offline-ready.
- **Recharts** (planned) → For visualizing expense trends.

---

## Current Features

1. **Add Expense Form** (amount, category, description, date) using `shadcn/ui` components.
2. **Transaction List** with modern card-based design.
3. **Persistent Storage** in IndexedDB so expenses remain after closing the app.
4. **Minimalistic Styling**: black/white base with a neutral blue accent, rounded corners, and subtle shadows.
5. **PWA Ready**: installable on iPhone and desktop browsers.
6. **Apple Touch Icon Support** for iOS home screen install.

---

## Planned Features

- **Dashboard with Monthly Charts** (Recharts bar chart for trends).
- **Categories Management** (custom categories).
- **Export/Import Data** (JSON/CSV).
- **Search and Filters** for transactions.

---

## Folder Structure

src/
components/ # React UI components
db/ # IndexedDB wrapper functions
lib/ # Utility functions (e.g., cn)
pages/ # Page-level components
styles/ # Tailwind CSS config
public/
icons/ # PWA icons (192px, 512px, etc.)
manifest.json # PWA configuration

---

## Key Implementation Notes

- **IndexedDB** via `idb`:
  - Store name: `expense_tracker`
  - Object stores: `transactions`, `categories`
  - All CRUD handled in `src/db/indexedDB.js`
- **shadcn/ui** is installed:
  - Components like `<Input>`, `<Button>`, `<Card>` replace native HTML elements.
  - Uses Tailwind for styling and theming.
- **Manifest.json** defines:
  - `name`, `short_name`, `icons`, and theme colors for installable app.
- **Offline Support** provided by service worker from Vite PWA plugin.

---

## Development Guidelines for LLMs / Coding Agents

- Keep UI consistent with black/white + neutral blue palette.
- Use shadcn/ui components for all form elements, buttons, and cards.
- Store all persistent data in IndexedDB via src/db/indexedDB.js.
- Do not introduce backend dependencies — app is offline-first.
- Any charts should use Recharts for consistency.
- When adding new features, ensure PWA compliance (manifest + icons).
