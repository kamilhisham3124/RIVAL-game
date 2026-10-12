TRD: RIVAL — Technical Requirements Document 

Companion to the RIVAL PRD. Every choice below is selected against your five axes: best, fastest, most flexible, most accessible, strongest — and optimized for solo vibe-coding (AI assistants write this stack with very few errors, which is itself a "fastest" criterion). 

 

1. Architecture at a Glance 

┌─────────────────────────────────────────────┐ 
│  Next.js 15 PWA (Vercel)                    │ 
│  ├─ Pure TS Game Engine (/engine) ← Vitest  │ 
│  ├─ Zustand (game state, persisted)         │ 
│  └─ TanStack Query (server state cache)     │ 
└──────────────┬──────────────────────────────┘ 
               │ direct client queries, RLS-enforced 
┌──────────────▼──────────────────────────────┐ 
│  Supabase (Postgres + Auth + Storage)       │ 
│  ├─ Anonymous auth → email upgrade          │ 
│  ├─ Row Level Security (no custom backend)  │ 
│  └─ pg_cron + Edge Functions (M3 push only) │ 
└─────────────────────────────────────────────┘ 
  

The load-bearing decision: per the PRD, rival XP is a pure client-side function of elapsed time. That means MVP needs no backend jobs, no cron, no custom API at all. The client queries Supabase directly through RLS. Supabase Edge Functions exist only for Milestone 3 push notifications. 

 

2. Stack Decision Table 

Layer 

Choice 

Why it wins on your five axes 

Rejected alternative 

Framework 

Next.js 15 (App Router) + TypeScript strict 

Largest AI training representation = best vibe-coding accuracy; PWA-capable; Vercel deploy in one click 

React Native/Expo (slower solo iteration; PRD mandates PWA) 

Styling 

Tailwind CSS v4 

Pixel aesthetic is 90% custom CSS anyway (hard shadows, steps() animations, image-rendering: pixelated); Tailwind is the thin utility layer AI writes flawlessly 

CSS-in-JS (runtime cost, worse AI output) 

Client state 

Zustand v5 (persist middleware) 

Tiny, no boilerplate; persisted store = free offline draft of check-offs 

React Context (re-render cascades on the ticking XP bar) 

Server state 

TanStack Query v5 

Caching + mutation retries + refetch-on-focus = the offline queue gets built-in help 

Raw Supabase calls everywhere (bespoke cache bugs) 

Backend 

Supabase 

Relational schema (PRD data model is relational), RLS replaces an entire API layer, anonymous→email upgrade is native, SQL migrations are AI-legible, Postgres = no lock-in (flexible) 

Firebase (document model fights the day_records/task_logs queries; anonymous upgrade flow is clunkier) 

Animation 

CSS steps() sprite animations + Framer Motion (lazy-loaded, Showdown screen only) 

Zero-cost sprite loops; Framer only where it earns its bundle size 

PixiJS/Phaser (game engines are overkill for bars + sprites) 

Hosting 

Vercel (Hobby, free) 

Preview deploys per git branch = visual regression safety while vibe-coding 

Netlify (equivalent; Vercel is canonical for Next.js) 

Package mgr / runtime 

pnpm + Node 20 LTS 

Fastest installs, strict lockfile 

npm/yarn 

Testing 

Vitest (engine) + Playwright (3 smoke tests, optional) 

The game engine is pure functions — cheap, high-value tests that catch AI-generated regressions in XP math 

No tests (risky: the entire product is XP arithmetic) 

 

3. The Game Engine (/engine) — Where "Strongest" Lives 

All PRD rules (Rival Rule, peak-planned-XP, grace window, forfeit, waking-hours accrual) are implemented as pure, deterministic TypeScript — no React, no network, fully unit-tested. This is the module that makes the app trustworthy. 

// engine/rival.ts 
rivalTarget(peakPlannedXP: number, k: Difficulty): number 
rivalXPAt(target: number, now: Date, day: DayConfig): number  // waking-hours window, seeded jitter 
nextRivalEvent(seed: RivalSeed): { xp: number; tauntId: string } 
 
// engine/day.ts 
localDayKey(tz: IanaTimezone, now: Date): "YYYY-MM-DD" 
inGraceWindow(now: Date, tz: IanaTimezone): boolean   // 00:00–04:00 counts for yesterday 
settle(userXP: number, rivalXP: number): "win" | "loss" | "draw" 
computeForfeit(tasks: Task[], logs: TaskLog[]): boolean 
  

Determinism trick (cross-device consistency): jitter and taunt selection use a seeded hash — seed = hash(userId + dayKey + hourBucket) — so the user's phone and laptop show identical rival events. No server needed for consistency. 

Required Vitest cases: DST boundary crossings, grace-window settlement, peak-planned-XP after mid-day task add/delete, k=0.5 calibration day, forfeit detection, tie handling. 

 

4. Database (Supabase Postgres) 

Paste-ready condensed schema — full DDL is a 10-minute AI generation from this skeleton: 

create type day_result as enum ('win','loss','draw','rest'); 
 
create table profiles ( 
  id uuid primary key references auth.users on delete cascade, 
  timezone text not null default 'UTC',          -- IANA string, captured at onboarding 
  level int not null default 1, 
  xp_total int not null default 0, 
  streak int not null default 0 
); 
 
create table rivals ( 
  user_id uuid primary key references auth.users on delete cascade, 
  name text not null, 
  sprite_ref text not null, 
  palette jsonb not null default '{}', 
  archetype text not null default 'blue', 
  difficulty_k numeric not null default 0.75, 
  rival_level int not null default 1 
); 
 
create table tasks ( 
  id uuid primary key default gen_random_uuid(), 
  user_id uuid not null references auth.users on delete cascade, 
  title text not null, 
  xp int not null check (xp >= 10), 
  schedule_type text not null default 'daily',   -- daily | weekdays | custom | once 
  focus boolean not null default false, 
  active boolean not null default true 
); 
 
create table task_logs ( 
  id uuid primary key default gen_random_uuid(), 
  task_id uuid not null references tasks on delete cascade, 
  user_id uuid not null references auth.users on delete cascade, 
  day date not null,                              -- user-local calendar day, not UTC 
  completed_at timestamptz not null default now(), 
  xp_awarded int not null, 
  unique (task_id, day)                           -- idempotent double-tap protection 
); 
 
create table day_records ( 
  user_id uuid not null references auth.users on delete cascade, 
  day date not null, 
  user_xp int not null, 
  rival_xp int not null, 
  rival_target int not null, 
  result day_result not null, 
  primary key (user_id, day)                      -- idempotent lazy settlement, multi-device safe 
); 
 
alter table profiles enable row level security; 
alter table rivals   enable row level security; 
alter table tasks    enable row level security; 
alter table task_logs enable row level security; 
alter table day_records enable row level security; 
-- one policy per table, e.g.: 
create policy "own_rows" on tasks for all 
  using (auth.uid() = user_id) with check (auth.uid() = user_id); 
  

Key rules encoded in the schema: 

unique(task_id, day) and primary key (user_id, day) make every write idempotent — the multi-device double-settlement risk from the PRD is solved by constraint, not by logic. 

day date stores the user's local calendar day; completed_at stores UTC. All "today" math happens client-side via engine/day.ts. This is why no cron exists. 

A single SQL trigger on auth.users insert auto-creates profiles + a default rivals row (starter rival "Blaze") — one AI-writable migration. 

Streaks and badges are derived at read time from day_records, never stored (flexible: rebalance without migrations). 

Timezone: date-fns-tz for local-day computation (Temporal is still not baseline — deliberately avoided). 

 

5. Auth Flow (PRD: "anonymous + upgrade") 

First launch → signInAnonymously() — zero-friction onboarding, user is playing in 10 seconds. 

Any later moment → "Lock in your progress" prompt → updateUser({ email }) (magic link) on the same user id — no data migration, anonymous identity is converted in place. 

Sessions via @supabase/ssr (cookie-based, App Router middleware). 

⚠️ Outdated-output warning: most AI-generated code you'll encounter still imports @supabase/auth-helpers-nextjs, which is deprecated. If your vibe-coding tool emits it, reject it and require @supabase/ssr. 

 

6. PWA, Offline & Notifications 

Concern 

MVP approach 

Installability 

Web App Manifest + Serwist service worker (the actively maintained successor to the abandoned next-pwa — reject next-pwa if the AI suggests it) 

Offline check-offs 

Optimistic UI: Zustand-persisted queue replays through TanStack Query on reconnect. Focus Timer runs locally, so gym-basement no-signal scenarios degrade gracefully 

In-app toasts (M2) 

Sonner or hand-rolled pixel toast — always works, all platforms 

Web Push (M3) 

Service worker + VAPID keys; Supabase pg_cron (hourly) → Edge Function → web-push to opted-in users whose local time matches trigger points (9 PM warning, morning prompt). Still no always-on server 

iOS reality 

Push requires iOS 16.4+ and home-screen install. Onboarding includes a one-time "Add to Home Screen" coach mark. In-app toasts remain the primary channel 

 

7. Asset Pipeline 

Asset 

Source 

License discipline 

Character sprites (idle/win/lose frames) 

Kenney.nl (CC0) or itch.io free/paid packs 

Record author + license in CREDITS.md at import time. CC-BY-SA packs are contaminating for sprite sheets — avoid or accept share-alike 

Editing (if customizing) 

Aseprite (~$20, industry standard) or LibreSprite/Piskel (free) 

— 

Fonts 

Google Fonts: Press Start 2P (headings, XP numbers), VT323 or Silkscreen (body — Press Start 2P is unreadable at body size), subset via next/font 

OFL, free 

SFX 

jsfxr (generate retro SFX in-browser, free) + freesound.org 

Check per-sound license on freesound 

Music (M2+) 

BeepBox (free browser chiptune sequencer) 

Self-made, clean 

Icons 

Pixelarticons (open source) or Kenney icon packs 

Verify license in repo 

Pixel-art CSS contract (enforce as Tailwind tokens): 4/8px spacing grid, box-shadow hard offsets (no blur anywhere), image-rendering: pixelated on all sprites, steps(N) keyframes for idle bounce, sprite scale locked to 2×/3×/4× integers only. 

 

8. Repo Structure (vibe-coding friendly) 

rival/ 
├─ app/                    # routes: /, /rival, /showdown, /history, /settings 
├─ components/             # XPBar, TaskRow, PixelButton, Toast, CountdownTimer 
├─ engine/                 # PURE game logic — the crown jewels, 100% tested 
│   ├─ rival.ts 
│   ├─ day.ts 
│   └─ taunts.ts           # template bank per archetype per event 
├─ store/                  # Zustand slices 
├─ lib/supabase/           # client, server, middleware helpers (@supabase/ssr) 
├─ supabase/migrations/    # versioned SQL — every schema change lands here 
├─ public/assets/          # sprites, sfx, fonts 
├─ tests/                  # Vitest (engine) + Playwright (smoke) 
└─ CREDITS.md              # asset licenses 
  

Rule for AI sessions: never let generated game math live outside /engine. Components render engine output; they never compute it. 

 

9. Milestone → Stack Mapping 

PRD Milestone 

New tech introduced 

M1 Core Loop 

Next.js 15, TS, Tailwind v4, Zustand, TanStack Query, Supabase (auth + schema + RLS), Vitest, Vercel. Nothing else. 

M2 Game Feel 

Framer Motion (lazy), Serwist PWA, asset pipeline, toast system, jsfxr SFX 

M3 Retention 

pg_cron + Edge Functions + VAPID push, badge derivation queries, Playwright suite 

 

10. Performance & Accessibility Budgets ("most accessible") 

Lighthouse: PWA ≥ 90, Accessibility ≥ 95 on home + showdown routes. 

Initial JS < 200 KB gzipped; Framer Motion and Showdown route are code-split. 

Text contrast ≥ 4.5:1 — audit the pixel palette against this; retro palettes routinely fail (bump lightness rather than abandon the palette). 

Every check-off is a real <button aria-pressed> with ≥ 44px touch target; full core loop keyboard-navigable. 

prefers-reduced-motion disables sprite idle bounce and XP-bar pulse (XP still ticks — state changes are never motion-only). 

All taunts/UI strings live in a single string bank (/engine/taunts.ts, /strings/) — free future localization. 

 

11. Risks & Mitigations 

Risk 

Mitigation 

Timezone/DST bugs corrupt day boundaries 

IANA tz stored at onboarding; DST cases are mandatory Vitest fixtures 

Multi-device double settlement 

PK/unique constraints make writes idempotent by construction 

Offline check-off conflicts 

Optimistic queue + unique constraints; last-write idempotent 

AI-generated regressions in XP math 

Strict TS + /engine purity rule + Vitest gate before deploy 

Deprecated AI suggestions (auth-helpers, next-pwa) 

Section 5 & 6 rejections are your paste-able counter-instructions 

Sprite license contamination 

CREDITS.md enforced at asset import; no CC-BY-SA sheets 

iOS push limitations 

In-app toasts primary; install coach mark at onboarding 

 

12. Cost 

Item 

MVP 

At scale 

Vercel Hobby 

$0 

$20/mo Pro when team/traffic demands 

Supabase Free (500 MB DB, 50k auth MAU) 

$0 

$25/mo Pro 

Assets 

$0–20 (one pack purchase optional) 

— 

Total MVP 

≤ $20 one-time 

 

 

Decisions to Veto 

Supabase over Firebase — chosen for relational fit, RLS-as-API, and no lock-in; Firebase's one advantage (native offline sync) is mitigated with the Zustand/TanStack queue. 

PWA over Expo/React Native — fastest solo iteration, instant updates, no store review. If App Store presence becomes a goal, the /engine module ports unchanged; only the shell rewrites. 

No custom API layer at all in M1 — client→Supabase direct under RLS. Edge Functions appear only in M3. 

Tailwind v4 — CSS-first config; if your AI tool writes v3-style tailwind.config.js, instruct it to use v4's @theme CSS syntax. 

Vitest-on-engine as a non-negotiable — the product is XP arithmetic; untested XP arithmetic is the single likeliest way this app silently breaks. 

 