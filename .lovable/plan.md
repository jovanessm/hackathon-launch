## Goal

Apply the Single Responsibility Principle to the frontend. Today, route files mix data fetching, filter state, scoring math, and large JSX for multiple distinct UI blocks. Each will be split so every file has one reason to change.

No behavior changes, no design changes, no server function changes. Pure structural refactor.

## What changes

### Dashboard (`src/routes/_authenticated/dashboard.tsx`, 179 lines)
Split into:
- `src/components/dashboard/FiltersSidebar.tsx` — search, source toggles, competency select, save-filter form
- `src/components/dashboard/OpportunityCard.tsx` — single ranked card (header, badges, rationale, why-now, evidence links, score panel)
- `src/components/dashboard/OpportunityModifiers.tsx` — expandable modifier list below a card
- `src/components/dashboard/OpportunityList.tsx` — maps filtered opps, handles expand/collapse state, empty state
- `src/hooks/useOpportunityFilters.ts` — filter state + filter predicate
- `src/lib/scoring.ts` — pure `computeFinalScore(baseline, modifiers)` helper
- The route file keeps only: query wiring + layout shell

### Watchlist (`src/routes/_authenticated/watchlist.tsx`, 132 lines)
Split into:
- `src/components/watchlist/AddItemForm.tsx` — kind/value/phase form + add mutation hookup via props
- `src/components/watchlist/WatchlistTable.tsx` — table shell + empty state
- `src/components/watchlist/WatchlistRow.tsx` — one row (phase change badge, transition select, history, remove)
- `src/lib/watchlist-helpers.ts` — `PHASES` constant + `isRecentPhaseChange(date)`
- Route file keeps query wiring + page header

### Documents (`src/routes/_authenticated/documents.tsx`, 118 lines)
Split into:
- `src/components/documents/UploadPanel.tsx` — file input, upload button, error display
- `src/components/documents/DocumentList.tsx` — left column list + remove
- `src/components/documents/EvaluationLogList.tsx` — right column log entries
- `src/hooks/useDocumentUpload.ts` — wraps storage upload + server fn mutation (extracts the mixed client-storage + serverFn logic out of the component)
- Route file keeps page header + grid layout

### Alerts (`src/routes/_authenticated/alerts.tsx`, 74 lines)
Split into:
- `src/components/alerts/AlertCard.tsx` — single alert (signal meter, body, mark/dismiss actions)
- `src/components/alerts/SignalMeter.tsx` — the strength bar
- Route file keeps query wiring + list/empty state

### Shared
- `src/components/ui/PageHeader.tsx` — reused `label-micro` + `h1` + description block used by all 4 pages (small DRY win that also isolates header presentation)

## Out of scope

- No changes to server functions, DB, RLS, auth, routes, or styles.
- No new dependencies.
- `filters.tsx` is already small (41 lines) — leave it alone.

## Technical notes

- All new components are presentational and receive data/handlers via props; no extra `useQuery` calls inside leaf components (keeps data ownership in the route).
- `useDocumentUpload` is the one hook that owns side-effecting logic (storage upload + mutation + error state) so the route stops importing `supabase` directly.
- `scoring.ts` becomes the single source of truth for `baseline * (1 + sum(modifiers))`, which is currently inlined in the dashboard card.
- File sizes target: every new file under ~80 lines; route files under ~50 lines after the split.
