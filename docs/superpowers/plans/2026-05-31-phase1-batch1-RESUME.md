# Phase 1 · Batch 1 — RESUME NOTE (handoff)

**Branch:** `phase1-batch1-settings-crud` (pushed to `origin`). Pull it at home: `git fetch && git checkout phase1-batch1-settings-crud`.

**Workflow in use:** subagent-driven-development executing the plan at
`docs/superpowers/plans/2026-05-31-phase1-batch1-settings-crud.md`
(spec: `docs/superpowers/specs/2026-05-31-phase1-batch1-settings-crud-design.md`).
Each task = implement → spec-compliance review → code-quality review → commit.

## Status

| Task | Feature | Status | Commit |
|---|---|---|---|
| T1 | Global settings inventory-defaults save (store tab) | ✅ done + reviewed | `af7db55` |
| T2 | Tax Categories CRUD (`sections/TaxSettings.tsx`, `taxes` tab) | ✅ done + reviewed | `8c0e24f` |
| T3 | Tax Rates CRUD (extends `TaxSettings.tsx`) | ✅ done + reviewed | `d979496` |
| T4 | Zone CRUD + member management (`sections/ZoneSettings.tsx`, `zones` tab) | ✅ done + reviewed | `d34e4dc` |
| T5 | Channel CRUD (`sections/ChannelSettings.tsx`, `channels` tab) | ✅ done + reviewed | `d2df2f0` |
| T6 | Create shipping method flow (`sections/ShippingMethodCreateModal.tsx`) | ⬜ TODO (next) | — |
| T7 | Create payment method flow (`sections/PaymentMethodCreateModal.tsx`) | ⬜ TODO | — |
| T8 | Final type-check/build + runtime checklist doc | ⬜ TODO | — |

**Resume at: Task 6.**

## Verified conventions (apply to all remaining tasks)

- **No codegen / no running backend needed** — all 31 operation `*Document` nodes already exist. Backoffice codegen reads the checked-in `apps/backoffice/src/graphql/schema.graphql` (offline) if ever needed.
- **Import Documents from `../../../graphql/generated/graphql`** (the `/graphql` suffix matters — the `index` barrel does NOT re-export them). From `sections/` use `../../../`.
- **`ZonesDocument` is paginated** → use `data.zones.items` (NOT a bare array).
- **`Select`** (`../../../components/ui/Select`) requires an **`options={[{value,label}]}`** prop — no `<option>` children.
- **`Modal`** uses `isOpen`/`onClose`/`title`/`size`. **`Button`** variants: primary|secondary|danger|ghost|outline, has `loading`. **`Input`** has `label`. **`Badge`** variants: default|success|warning|danger|info. **`ConfirmDialog`**: `isOpen`/`onClose`/`onConfirm`/`title`/`message`/`confirmText`/`variant`/`loading`. `Table` exports `TableHeader/TableBody/TableRow/TableHead/TableCell`.
- **Toasts:** `import { addToast } from '../../../store/slices/uiSlice'` + `useDispatch()` → `dispatch(addToast({ message, type }))`, type ∈ success|error|info|warning.
- **No `PermissionGate`** (Settings.tsx doesn't use it — deliberate consistency; revisit later as a separate RBAC concern, see BO-7 in `feature_audit.md`).
- **No `window.location.reload()`** — use the `useQuery` `refetch()` after mutations.
- **Delete** ops return `DeletionResponse` — check `result.result === 'DELETED'` before success toast.
- **Union results:** `createChannel`/`updateChannel` return `Channel | LanguageNotAvailableError` — must check `__typename`/`errorCode` (see plan Task 5).
- **Verify each task:** `pnpm --filter @oscar/backoffice exec tsc --noEmit` (no `type-check` script) + `pnpm --filter @oscar/backoffice build`, then commit. Runtime verification is deferred (backend not running; only `.env.example` present) — T8 produces a runtime checklist for manual testing once the backend is up.

## Tab order in Settings.tsx `tabs` array
…shipping, payment, **taxes** (done), **zones** (T4), **channels** (T5), email, users, system.

## Open follow-ups (non-blocking, noted in reviews)
- `catch (err: any)` used throughout (matches existing file convention). Could tighten to `unknown` uniformly later.
- Mutation success paths don't always inspect result unions where one exists (e.g. T1 `updateGlobalSettings`); unreachable for current inputs. T5 channels MUST handle its union.
