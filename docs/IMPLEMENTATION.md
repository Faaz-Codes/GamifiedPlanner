# Local implementation notes

The application is intentionally single-user and browser-only. UI components call the planner service, which performs IndexedDB transactions through the database adapter. This keeps persistence, ledger writes, and import validation outside the presentation layer.

The timestamp-based focus timer is persisted in the settings record. A refresh recomputes its remaining time from `endsAt`, avoiding drift from throttled intervals.
