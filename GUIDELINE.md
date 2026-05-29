# Coding Agent Guidelines

> Rules for AI coding agents (Copilot, Cursor, Claude, etc.) working on this codebase.  
> **Read GUIDELINES.md first.** This document extends it with agent-specific behavior.

---

## 0. Prime Directives

1. **Read before writing.** Always read the relevant existing files before generating new code.
2. **Follow the existing pattern.** Match the style, structure, and abstractions already in the codebase — do not invent new ones.
3. **Ask before assuming.** If the task is ambiguous, ask one clarifying question rather than guessing and generating wrong code.
4. **Small, verifiable steps.** Prefer multiple small changes over one massive diff. Each step should leave the codebase in a working state.
5. **Never silently skip.** If you cannot complete part of a task, say so explicitly — do not generate placeholder stubs without flagging them.

---

## 1. Before Writing Any Code

### Always read first

```
Before touching any file, read:
├── The file you are about to edit
├── Its closest sibling files (same folder)
├── The feature's schemas.ts and types.ts
└── Any imported modules from lib/ or shared components
```

**Why:** Agents that skip reading generate code that duplicates existing utilities, uses wrong type names, or misses established patterns.

### Confirm the task scope

Before starting, restate in one sentence:
- What you will change
- What files will be affected
- What you will NOT change

If uncertain about scope, ask. Do not assume.

---

## 2. File & Folder Rules

### Never create files in the wrong place

| What you are creating | Where it goes |
|---|---|
| New UI primitive / base component | ❌ Never — use shadcn instead |
| Shared presentational component | `components/shared/` |
| Feature-specific component | `features/<domain>/components/` |
| Recharts wrapper | `components/charts/` |
| Zod schemas + inferred types | `features/<domain>/schemas.ts` + `types.ts` |
| Supabase query functions | `features/<domain>/api.ts` |
| TanStack Query options | `features/<domain>/queries.ts` |
| Custom hooks | `features/<domain>/hooks.ts` |
| Server function | `server/functions/<domain>.ts` |
| Route file | `app/routes/<path>.tsx` |
| Shared utility | `lib/utils.ts` (or a new focused file in `lib/`) |

### Never create these

- `helpers.ts` — use `lib/utils.ts` or domain-specific utilities
- `constants.ts` at the root — co-locate constants with the feature
- `index.ts` barrel files unless explicitly asked — they cause circular import issues
- Any file ending in `.js` — this is a TypeScript project
- `types.ts` with manually written interfaces — derive from Zod schemas

### Before creating a new file, check if it already exists

```
Does a schema for this domain already exist in features/<domain>/schemas.ts?
Does a utility for this already exist in lib/utils.ts?
Does a similar component exist in components/shared/?
```

If yes, **extend** the existing file. Do not create a duplicate.

---

## 3. TypeScript Rules for Agents

### Never use these

```ts
// ❌ Never
any
// @ts-ignore
// @ts-expect-error  (only allowed with an explanation comment)
as SomeType  // type casting — use Zod .parse() instead
!  // non-null assertion — use proper null checks
```

### Always do these

```ts
// ✅ Infer types from Zod
export type Market = z.infer<typeof marketSchema>

// ✅ Explicit return types on exported functions
export function getScoreTier(score: number): 'high' | 'medium' | 'low' { ... }

// ✅ Narrow with guards, not casts
if (error instanceof Error) { ... }

// ✅ Use satisfies for config objects
const config = { ... } satisfies ChartConfig
```

### When you need a new type

1. Check if the type can be derived from an existing Zod schema with `.pick()`, `.omit()`, `.partial()`, or `.extend()`
2. If not, add a new schema to `features/<domain>/schemas.ts` first, then export the inferred type from `types.ts`
3. Never write a standalone `interface` or `type` that mirrors a database column — always go through Zod

---

## 4. Zod Schema Rules

### One schema per concept, composed from smaller schemas

```ts
// ✅ Compose — don't repeat yourself
export const marketBaseSchema = z.object({ id: z.string().uuid(), name: z.string() })
export const marketSchema = marketBaseSchema.extend({ score: z.number().min(0).max(100) })
export const marketFilterSchema = marketBaseSchema.pick({ id: true }).extend({ minScore: z.number().optional() })
```

### Validate at every boundary

Agents must add Zod validation at:
- API response from Supabase
- Server function input (`.validator()`)
- Form submit handler (`zodResolver`)
- Any `JSON.parse()` call
- Any `fetch()` response

### Never add `.optional()` to silence a TypeScript error

If a field is optional in the schema, it must be genuinely optional in the domain. If it is required, fix the data source — do not weaken the schema.

---

## 5. Component Rules

### Structure every component the same way

```tsx
// 1. Imports (external libs → internal lib → features → components → types)
// 2. Types / interfaces
// 3. Variants (CVA) if applicable
// 4. Named export of the component function
// 5. Sub-components or helpers below the main export

import { type FC } from 'react'                     // external
import { cn } from '@/lib/utils'                     // internal lib
import type { Market } from '@/features/markets/types' // feature type
import { TierBadge } from '@/components/shared/TierBadge' // shared component

interface MarketCardProps {
  market: Market
  onSelect?: (id: string) => void
}

export const MarketCard: FC<MarketCardProps> = ({ market, onSelect }) => {
  ...
}
```

### Things agents must never do in components

```tsx
// ❌ Default export
export default function MarketCard() { ... }

// ❌ Fetch data inside a component
const { data } = await supabase.from('markets').select('*')

// ❌ Inline object/array props (new reference every render)
<Chart config={{ color: 'red' }} data={[1, 2, 3]} />

// ❌ Hardcoded colors outside of CSS variables
<div style={{ color: '#1e40af' }} />

// ❌ Logic in JSX
<div>{score > 70 ? <GoodBadge /> : score > 40 ? <OkBadge /> : <BadBadge />}</div>

// ❌ useEffect for data that should come from the server
useEffect(() => { fetchMarkets().then(setMarkets) }, [])
```

### Correct data flow

```
Route loader (server)
  → ensureQueryData(queryOptions)
    → Component (useSuspenseQuery)
      → receives data already in cache
        → passes data as props to child components
          → child components are pure / presentational
```

---

## 6. TanStack Query Rules

### Never write a query key as a raw string or inline array

```ts
// ❌ Bad — scattered, inconsistent, typo-prone
const { data } = useQuery({ queryKey: ['market', id], queryFn: ... })

// ✅ Good — always use the factory from queries.ts
const { data } = useSuspenseQuery(marketQueryOptions(id))
```

### When adding a new query

1. Add the Supabase function to `features/<domain>/api.ts`
2. Add the `queryOptions` factory to `features/<domain>/queries.ts`
3. Add a custom hook to `features/<domain>/hooks.ts`
4. Use the hook in the component
5. Wire `ensureQueryData` in the route loader

Never skip step 5 — SSR requires the loader.

### Mutation rules

```ts
// ✅ Always invalidate after mutation — never manually set query data
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['markets'] })
}

// ❌ Never do this — causes stale UI
onSuccess: (data) => {
  queryClient.setQueryData(['markets', data.id], data)
}
```

---

## 7. Supabase Rules

### Always use the typed client

```ts
// ✅ Typed — catches column name typos at compile time
import { supabase } from '@/lib/supabase/client'
const { data } = await supabase.from('markets').select('id, name, opportunity_score')

// ❌ Untyped
const { data } = await createClient().from('markets').select('*')
```

### Never use `.select('*')` in production queries

Always name the columns you need. This prevents over-fetching and makes the type narrower.

```ts
// ❌
.select('*')

// ✅
.select('id, name, region, opportunity_score, glass_type, updated_at')
```

### Always handle both `data` and `error`

```ts
// ✅ Required pattern
const { data, error } = await supabase.from('markets').select(...)
if (error) throw new Error(`fetchMarkets: ${error.message}`)
return marketSchema.array().parse(data)

// ❌ Never ignore error
const { data } = await supabase.from('markets').select(...)
return data
```

### Never write Supabase queries outside of `features/<domain>/api.ts`

Not in components. Not in hooks. Not in route loaders directly. Always through the API layer.

---

## 8. Server Function Rules

```ts
// ✅ Correct server function anatomy
export const getMarketsFn = createServerFn({ method: 'GET' })
  .validator(marketFilterSchema)       // always validate input
  .handler(async ({ data }) => {
    // thin handler — delegate to api.ts
    return fetchMarkets(data)
  })
```

### Rules agents must follow

- Every server function **must** have `.validator()` — no exceptions.
- Handlers must be thin — business logic goes in `features/<domain>/api.ts`.
- Never import `window`, `document`, `localStorage`, or any browser API in server functions.
- Return only plain serializable values: strings, numbers, booleans, plain objects, arrays.
- Never return `Date` objects — use `.toISOString()` strings.
- Never return Supabase `PostgrestResponse` directly — unwrap and validate first.

---

## 9. Styling Rules

### Class order in JSX

Follow this order (Prettier Tailwind plugin enforces this automatically):
```
Layout → Flexbox/Grid → Spacing → Sizing → Typography → Color → Border → Effects → Transitions
```

### Conditional classes — always use `cn()`

```tsx
// ❌
className={`rounded ${isActive ? 'bg-primary' : 'bg-muted'}`}

// ✅
className={cn('rounded', isActive ? 'bg-primary' : 'bg-muted')}
```

### Never hardcode colors

```tsx
// ❌
style={{ color: '#15803d' }}
className="text-[#15803d]"

// ✅ Use CSS variables defined in globals.css @theme
className="text-tier-high"
style={{ color: 'var(--color-tier-high)' }}
```

### Never modify files in `components/ui/`

If a shadcn component needs an extension, create a wrapper in `components/shared/`:

```tsx
// components/shared/ScoreInput.tsx
import { Input } from '@/components/ui/input'  // use, don't modify

export function ScoreInput(props: React.ComponentProps<typeof Input>) {
  return <Input type="number" min={0} max={100} {...props} />
}
```

---

## 10. Error Handling Rules

### Throw `Error` instances, not strings

```ts
// ❌
throw 'Market not found'

// ✅
throw new Error(`Market not found: ${marketId}`)
```

### Every route must have errorComponent and pendingComponent

When an agent adds a new route, it must also add:

```tsx
export const Route = createFileRoute('/markets/$marketId')({
  loader: ...,
  component: MarketDetailPage,
  errorComponent: MarketErrorBoundary,   // required
  pendingComponent: MarketSkeleton,      // required
})
```

### Never swallow errors silently

```ts
// ❌
try {
  await fetchMarkets()
} catch {
  // do nothing
}

// ✅
try {
  await fetchMarkets()
} catch (error) {
  console.error('[fetchMarkets]', error)
  throw error  // re-throw so TanStack Query / error boundary can handle it
}
```

---

## 11. What Agents Must Never Do

These are hard stops — if any of these are required to complete the task, stop and ask.

| Never | Instead |
|---|---|
| Add `any` type | Use `unknown` + Zod parse |
| Fetch in a component | Fetch in loader, consume with `useSuspenseQuery` |
| Write raw SQL | Use Supabase client with typed schema |
| Modify `components/ui/*` | Wrap in `components/shared/*` |
| Create a `types.ts` with manual interfaces | Derive with `z.infer<>` |
| Use `useEffect` for data fetching | Use TanStack Query |
| Default export a component | Named export only |
| Use `.select('*')` | Select only needed columns |
| Skip `.validator()` on server functions | Always validate |
| Hardcode colors in JSX | Use CSS variables / Tailwind tokens |
| Create barrel `index.ts` files | Import directly from the source file |
| Access `process.env` directly | Use validated `clientEnv` / `serverEnv` from `lib/env.ts` |
| Add console.log in committed code | Use proper error logging |

---

## 12. When Adding a New Feature

Follow this exact sequence — do not skip steps:

```
1. Add Zod schema(s)        →  features/<domain>/schemas.ts
2. Export inferred types     →  features/<domain>/types.ts
3. Add Supabase queries      →  features/<domain>/api.ts
4. Add queryOptions          →  features/<domain>/queries.ts
5. Add custom hooks          →  features/<domain>/hooks.ts
6. Add server function       →  server/functions/<domain>.ts
7. Add route file            →  app/routes/<path>.tsx  (with loader, errorComponent, pendingComponent)
8. Add components            →  features/<domain>/components/
9. Add tests                 →  co-located .test.ts files
```

Each step depends on the previous. Do not write components before schemas exist.

---

## 13. When Editing an Existing Feature

```
1. Read the existing file fully before making changes
2. Read schemas.ts and types.ts for the feature
3. Make the minimal change needed — do not refactor unrelated code
4. If you find a bug while implementing, note it but do not fix it unless asked
5. Update tests if behavior changes
6. Do not rename exports — it breaks other imports
```

---

## 14. Code Review Checklist for Agents

Before marking a task complete, verify:

- [ ] No `any`, `@ts-ignore`, or unsafe type casts
- [ ] All new types derived from Zod schemas
- [ ] All API responses validated with Zod `.parse()`
- [ ] No Supabase queries outside of `features/<domain>/api.ts`
- [ ] No data fetching inside components or hooks (only query consumption)
- [ ] Route has `errorComponent` and `pendingComponent`
- [ ] Server function has `.validator()`
- [ ] No hardcoded colors (only Tailwind tokens / CSS variables)
- [ ] No default exports
- [ ] No `.select('*')` in Supabase queries
- [ ] No `useEffect` for data fetching
- [ ] Files created in the correct location per the project structure
- [ ] No new barrel `index.ts` files created
- [ ] Env variables accessed through `lib/env.ts`, not `process.env` directly

---

## 15. Communication Rules

### When starting a task

State clearly:
> "I will modify `features/markets/api.ts` to add `fetchMarketsByRegion`, update `queries.ts` with a new query options factory, and add a hook in `hooks.ts`. I will not touch the route or component layer."

### When you find an issue

State clearly:
> "I noticed `marketSchema` is missing the `glassType` field. I will add it to the schema and update the inferred type. This is a prerequisite for the task."

### When you cannot proceed

State clearly:
> "I need to know the Supabase table name for opportunity scores before I can write the API function. The task cannot be completed without this."

### When a task is complete

List exactly what changed:
> - Added `fetchOpportunityScores` to `features/opportunities/api.ts`
> - Added `opportunityScoresQueryOptions` to `features/opportunities/queries.ts`  
> - Added `useOpportunityScores` hook to `features/opportunities/hooks.ts`
> - No other files were modified