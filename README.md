# RIVAL

A mobile-first habit RPG. Plan meaningful tasks, earn XP, and compete against a deterministic pixel rival. Built from the supplied [PRD](docs/PRD.md), [TRD](docs/TRD.md), [design](docs/DESIGN.md), and [app flow](docs/APP-FLOW.md).

## Run in VS Code on Windows

Open **only** `C:\Users\kamil\workspace\RIVAL-game` in VS Code. Pull the feature commits into that checkout when they are published. This cloud task cannot modify or open your Windows folder directly.

Use an existing Node.js 22+ installation and pnpm 11.25.0. No global installations or system configuration changes are required by this repository. The original TRD's Node 20 target is now superseded by the supported Node 22 baseline for the resolved toolchain.

```powershell
cd C:\Users\kamil\workspace\RIVAL-game
pnpm install --frozen-lockfile
pnpm dev
```

Local development runs on port 3000. In this cloud environment the checkout is `/workspace/RIVAL-game`. Each cloud task is already isolated; use that checkout and do not create a worktree unless requested.

Package caches are configured inside the project. If your cloud shell requires XDG paths:

```bash
XDG_DATA_HOME="$PWD/.cache/data" XDG_CACHE_HOME="$PWD/.cache" XDG_STATE_HOME="$PWD/.cache/state" pnpm install --frozen-lockfile
NEXT_TELEMETRY_DISABLED=1 pnpm dev
```

## What works

- Four-step onboarding, named rival, three original sprites, personalities and difficulty. First day uses a 50% calibration target.
- Task create/edit/soft-delete; daily, weekday, selected-day and one-time schedules; reversible completions; focus timers that survive reload and pauses.
- Deterministic, seeded hourly rival accrual between 06:00 and midnight; the target tracks **peak** planned XP and never falls after edits.
- Completion-only yesterday view during the 00:00–04:00 grace window; lazy, idempotent local settlement, missed-day forfeits and showdown recap.
- One rest day per rolling seven days, only before the first completion; immutable settled results, levels, cosmetic evolutions, streaks, badges and history.
- System/light/dark themes, legibility mode, reduced-motion support, native accessible dialogs, keyboard controls and color-independent result markings.
- Self-hosted fonts and original pixel artwork; optional synthesized task sounds. Production Serwist service worker, installable manifest and offline reload of visited/pre-cached routes.
- Local JSON backup export and explicitly confirmed local erase.

**Storage:** local play persists in this browser only. Clearing site data removes progress; export a backup first. Supabase auth, multi-device sync, email upgrade and background push are intentionally deferred until the project is connected. Prepared adapters/schema and the remaining integration work are documented in [SUPABASE.md](docs/SUPABASE.md). No production credentials are required for local play.

## Validate

```bash
pnpm test        # Engine fixtures: XP rules, grace, DST, rest, forfeits, focus
pnpm build      # Type validation, production routes and service worker
pnpm typecheck
pnpm exec playwright install chromium  # Optional browser download, no OS changes
pnpm test:e2e   # Playable flow, mobile axe checks, showdown and offline reload
```

For an existing Chromium installation in Linux, set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to its path. Production mode is required to exercise the service worker; it is disabled during `pnpm dev`.

GitHub Actions validates installs, engine tests, production build and browser smoke/accessibility checks on pull requests and feature branches. It is configured locally; its remote execution is not claimed until commits are pushed and Actions runs.

## Feature commits

Use Conventional Commits: `feat(engine): …`, `feat(tasks): …`, `fix(settlement): …`, `test(a11y): …`. Keep each feature reviewable and tested. For concurrent feature work use separate feature branches or isolated agent ownership; Git commits on a shared index must be serialized. Do not let multiple workers commit the same files concurrently.

Keep game arithmetic inside `engine/`. Components render engine results. Production deployment, Supabase resources and push credentials require their own explicit configuration; this repository does not deploy them automatically.
