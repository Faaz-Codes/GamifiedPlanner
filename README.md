# Gamified Study Planner V2

A Supabase-first study planner where tasks and focus sessions produce an auditable XP ledger, activity days, streaks, goals, and collectable postcard progress. The UI has a deliberately isolated **Demo Mode** for presentations; it never writes demo records to a real account.

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Without environment variables, the app starts in Demo Mode. To use a real Supabase project, set only these public browser values:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-project-anon-key
```

Never expose a Supabase service-role key in Vite variables.

## Supabase setup

1. Create a Supabase project and configure its Auth providers in the Supabase dashboard.
2. Install the Supabase CLI, link the project, then apply the migration:
   ```bash
   supabase db push
   ```
3. Add the two variables above to `.env.local` and restart Vite.

`supabase/migrations/202609080001_v2_schema.sql` creates profiles, tasks, recurring tasks, the immutable `xp_transactions` ledger, activity days, Pomodoro sessions, deterministic daily goals, achievements, inventory/shop, postcards, themes, and daily rewards. User-owned records are protected by `auth.uid() = user_id` RLS policies. Public catalogues are read-only to clients.

## Game rules

- Easy / medium / hard tasks award 10 / 20 / 30 XP through `complete_task`, which row-locks the task and uses a unique ledger reference to defeat duplicate completion requests.
- Undo creates a compensating ledger record through `undo_task_completion`; completed task history is retained.
- Level math lives in `level_for_xp`: `floor(sqrt(total_xp / 100)) + 1`.
- Activity days are the source for calendar, focus totals, and streak calculations. Focus timers use an end timestamp so throttled tabs do not drift.

## Current integration boundary

The responsive V2 interface, isolated demo sandbox, task CRUD path, task completion/undo RPCs, and the database/RLS foundation are included. Before production launch, add the remaining catalogue seed migration and wire the provided UI controls to authenticated Supabase sessions and the corresponding server-side RPCs (shop/reward/recurrence) after your project’s auth UX is chosen. This protects game economy operations from being client-controlled.
