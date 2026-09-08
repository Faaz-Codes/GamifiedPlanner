# Gamified Planner — local edition

Gamified Planner is a private, offline-first study planner. Tasks, focus sessions, the XP ledger, calendar activity, settings, and catalogue data live in the browser's IndexedDB database. Core features make no network requests and require no account or server.

## Run locally

```bash
npm install
npm run dev
```

Run checks with `npm test` and `npm run build`.

## Local data

`src/db/database.js` owns the `gamified-planner-local` IndexedDB database and creates stores for profiles, tasks, recurring tasks, XP transactions, activity days, focus sessions, daily goals, achievements, inventory, postcards, themes, rewards, and settings. Services in `src/services/plannerService.js` own all writes, including the XP ledger and duplicate-reward reference keys.

Use **Settings → Export my data** to download a complete JSON backup. Imports require the complete exported structure and show a browser confirmation before replacing local records. The **Try Demo** control is a visual preview and never writes to the real local database.

## Limitations and next steps

Data belongs to the current browser profile, so export a backup before clearing browser storage or moving devices. The interface includes the core local task, timer, calendar, stats, theme, and backup flows; additional catalogue progression and recurring-task screens can be expanded without changing the persistence boundary.
