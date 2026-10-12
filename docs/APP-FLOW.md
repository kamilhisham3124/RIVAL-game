APP FLOW: RIVAL 

Companion to the PRD and TRD. This document is the wiring diagram: every screen, every transition, every state a user can be in, and every edge-case path — ready to paste into your vibe-coding tool alongside the other two docs. 

 

1. Navigation Architecture 

                ┌───────────────┐ 
                 │  /onboarding  │  first launch only, never again 
                 └───────┬───────┘ 
                         ▼ 
 ┌──────────┐     ┌─────────────┐     ┌────────────┐ 
 │/history  │◀───▶│  / (Today)  │◀───▶│ /settings  │ 
 └──────────┘     └──────┬──────┘     └────────────┘ 
                         │  ▲ 
          ┌──────────────┘  └─────────────┐ 
          ▼                               ▼ 
   ┌─────────────┐              ┌────────────────┐ 
   │   /rival    │              │   /showdown    │ 
   │ customize   │              │ guarded route: │ 
   └─────────────┘              │ auto-redirect  │ 
                                │ after settle   │ 
                                └────────────────┘ 
  

Route guards: 

Route 

Guard behavior 

/onboarding 

Redirects to / if user already has tasks 

/ 

On open/focus: runs Settlement Check (§7.4). If an unsettled day exists and grace window is closed → redirect to /showdown?day=latest 

/showdown 

Redirects to / if no settled day is pending review 

/rival, /history, /settings 

Free navigation 

Modal/sheet layer (not routes — rendered over any screen): Focus Timer sheet, Add/Edit Task sheet, Rest Day confirm, Delete Task confirm, Email Upgrade modal, Level-Up modal, global Toast layer. 

 

2. Global Rules Governing All Flows 

These five invariants come from the PRD/TRD and constrain every screen. The AI builder must not violate them: 

Rival XP is always computed, never stored live — rivalXPAt(target, now, dayConfig) renders on every tick. Source of truth for a finished day is its day_records row. 

Settlement is lazy and idempotent — happens on first open/focus after the grace window closes; primary key (user_id, day) makes double-settlement impossible across devices. 

Yesterday's list freezes at 00:00 — during grace, completion-only. Edits always apply to today or later. 

Rival target only ratchets up — any mid-day change that increases planned XP raises the target; nothing ever lowers it. 

Settled days are immutable — history, streaks, badges derive from locked day_records. 

 

3. Onboarding Flow 

Silent step 0 (no UI): anonymous sign-in fires on first paint; IANA timezone auto-detected and stored; starter profile row created by SQL trigger. 

Step 1: THE PITCH          Step 2: MEET YOUR RIVAL       Step 3: STAKES 
┌─────────────────┐        ┌─────────────────┐          ┌─────────────────┐ 
│ 1 screen, 3     │        │ Sprite picker   │          │ Difficulty:     │ 
│ bullets + pixel │───────▶│ Palette swatches│─────────▶│ Chill 60%       │ 
│ art. "Beat the  │        │ Name (default   │          │ Rival 75%       │ 
│ version of you  │        │ "Blaze" + 🎲)   │          │ Nightmare 90%   │ 
│ that never      │        │ Archetype card  │          │ + Day 1 badge:  │ 
│ slacks."        │        │ (3 personas)    │          │ "k=0.5 today"   │ 
└─────────────────┘        └─────────────────┘          └────────┬────────┘ 
                                                                 ▼ 
                                     Step 4: FIRST 3 TASKS     Step 5: HOME 
                                     ┌─────────────────┐      ┌─────────────────┐ 
                                     │ Template chips: │      │ Taunt toast:    │ 
                                     │ Study 50m · 25  │      │ "See you at     │ 
                                     │ Gym 1h · 35     │─────▶│ midnight."      │ 
                                     │ Water 8 · 15    │      │ Calibration Day │ 
                                     │ + custom add    │      │ is LIVE (k=0.5) │ 
                                     └─────────────────┘      └─────────────────┘ 
  

Rules: every step skippable-forward except rival name + first task; Back always available; Day 1 forces k=0.5 (engine flag calibrationDay) regardless of the difficulty picked in Step 3 — that choice locks in on Day 2. 

 

4. The Day Lifecycle (State Machine) 

Every calendar day for a user is in exactly one of these states: 

             ┌─────────────┐   Rest toggle    ┌───────────────────┐ 
              │   PLANNED   │─────────────────▶│ REST              │ 
              │ ≥1 task     │  (only before    │ both XP = 0,      │ 
              │ 0 XP user   │   first check-   │ streak frozen,    │ 
              └──────┬──────┘   off)          │ result = 'rest'   │ 
   first check-off  │                        └─────────┬─────────┘ 
                    ▼                                  │ 
              ┌─────────────┐                          │ 
              │   ACTIVE    │      00:00 local         │ 
              │ user XP > 0 │────────────┐             │ 
              └──────┬──────┘            ▼             │ 
                     │            ┌─────────────┐      │ 
                     └───────────▶│   GRACE     │      │ 
                                  │ 00:00–04:00 │      │ 
                                  │ rival frozen│      │ 
                                  │ user can    │      │ 
                                  │ still score │      │ 
                                  └──────┬──────┘      │ 
                                         │ first open  │ 
                                         │ after 04:00 │ 
                                         ▼             ▼ 
              ┌────────────────────────────────────────────────┐ 
              │  SETTLED (immutable)                           │ 
              │  win · loss · draw · rest                      │ 
              │  forfeit = loss subtype (tasks>0, completions=0)│ 
              └────────────────────────────────────────────────┘ 
   (Days with zero scheduled tasks → no state, no record, no punishment) 
  

 

5. The Core Daily Loop (Primary Journey) 

The 24-hour journey, end to end: 

# 

Moment 

What happens 

Screen feedback 

1 

Open app (morning) 

Settlement Check runs → if yesterday pending and past 04:00 → Showdown first 

Showdown recap → "Start today" → Home 

2 

Home renders 

Recurring tasks roll in; rival accrual starts at 06:00 

Dual bar: you at 0, rival ticking from 0 

3 

Complete a task 

Tap check (Focus tasks gate through timer) 

Bar animates, XP number pops, haptic, taunt chance 

4 

Rival event (hourly, seeded) 

Deterministic tick + jitter 

Rival bar jumps; occasional toast ("Blaze finished a set. +12") 

5 

Overtake event 

Rival XP crosses user XP 

Guaranteed toast + red bar flash + haptic: "Blaze leads by 8. Pathetic." 

6 

Mid-day edit 

Add/delete task → target ratchet applies 

Toast: "Rival target rose to 180" / "Blaze doesn't give XP back." 

7 

21:00 (M3 push) 

If trailing: warning push 

"Blaze leads by 30. Your move." 

8 

00:00 

Rival freezes at ~target; grace opens 

Home shows yesterday in Grace Mode with banner 

9 

Next open after 04:00 

Settlement Check → Showdown 

Full battle recap, result, streak/badges, rival dialogue 

10 

Loop 

"Start today" → new day, clean bar 

Fresh-start effect 

 

6. Screen-by-Screen Specs 

6.1 Home — / (the 90% screen) 

Element 

Spec 

Header 

Date ("Tue, Mar 4"), streak flame + count, user level badge, gear → settings 

Race Module 

User sprite (idle steps() bounce) vs rival sprite face-off; two XP bars; live gap label: "LEAD BY 40" (green) / "BEHIND BY 15" (red); rival XP re-renders every 60s + on focus 

Rest toggle 

Shield button, visible only while day is PLANNED (§7.3) 

Task list 

Rows: category icon, title, XP chip, focus-clock icon if timed, check circle (44px, aria-pressed); completed = grey + strike 

Add Task 

FAB → bottom sheet: title, XP (default suggestion 1 XP/2 min), schedule (daily/weekdays/custom/once), Focus toggle 

Empty state 

"Blaze is waiting. Plan your day." + 3 template chips 

Mathematically-lost state 

When remaining possible XP < gap: bars grey, label "Blaze has this one." No shaming. (Veto candidate — Decision 6) 

Engine calls: rivalTarget, rivalXPAt, localDayKey, inGraceWindow, nextRivalEvent. 

6.2 Rival Hub — /rival 

Big animated sprite preview · name edit · sprite picker · palette swatches · archetype selector (3 cards, each with a sample taunt line) · difficulty selector with the k-to-percentage table · rivalry record (W-L-D all-time) · rival level + progress to next evolution. 

Rule displayed in UI: difficulty and archetype changes apply tomorrow; sprite/palette/name apply instantly (cosmetic). 

6.3 Showdown — /showdown?day=YYYY-MM-DD 

Sequence, top to bottom: 

VS entrance — sprites slam in, screen shake (disabled under prefers-reduced-motion) 

Recap log — round-by-round feed reconstructed from task_logs + deterministic rival events: "8:14 AM — You completed 'Gym' +35" / "11:02 PM — Blaze finished training. +12" 

Final bars animate to true values → banner: VICTORY / DEFEAT / DRAW 

Rival dialogue — one line from the archetype's bank (win → grudging respect; loss → gloat; draw → insufferable) 

Rewards panel — XP earned, level progress bar (Level-Up modal if crossed, evolution fanfare every 5 levels), badges unlocked, streak status 

CTA — "Start today →" → marks showdown seen → Home 

6.4 History — /history 

Streak header · month calendar, days color-coded W/L/D/REST, future blank · tap day → detail sheet (result, user XP vs rival XP vs target, completed task log) · badges grid · totals row (wins, best streak, completion %). All read-time derived from day_records — no new writes. 

6.5 Settings — /settings 

Account (email upgrade status, sign out) · timezone (auto-detected, editable, warning modal on change) · notifications (M3: morning prompt time picker, 9 PM warning toggle) · shortcut to /rival · Credits (from CREDITS.md) · Danger zone: delete account. 

 

7. Key Interaction Sequences 

7.1 Check-off — normal task 

Tap check → optimistic toggle + bar animates instantly 
         → write task_logs (idempotent via unique(task_id, day)) 
         → online: success, invalidate queries 
         → offline: persist to Zustand queue, replay on reconnect 
Tap again (undo, pre-settlement only) → delete log → XP reverts 
  

Undo never exploits anything: it only lowers your XP. 

7.2 Check-off — Focus task 

Tap row → Focus Timer sheet (locked check circle, countdown) 
        → user may leave app; timer runs locally 
        → timer completes → check circle unlocks + chime 
        → tap check → same optimistic flow as 7.1 
Abandon timer? No partial XP. Task simply stays unchecked. 
  

7.3 Rest Day 

Available ONLY while day = PLANNED (zero completions) 
Tap shield → confirm sheet: "No XP for anyone. Streak freezes. 1 per week." 
Engine marks dayConfig.isRest → rivalXPAt returns 0 all day 
Settlement writes result='rest' → calendar shows REST, streak preserved not advanced 
Weekly limit enforced by counting 'rest' in rolling 7 days from day_records 
  

7.4 Settlement Check (runs on app open + TanStack refetch-on-focus) 

day = localDayKey(tz, now) 
if inGraceWindow(now): 
    if yesterday unsettled → Home renders YESTERDAY in Grace Mode 
    else                   → normal Home 
else: 
    for each unsettled day D < today (oldest → newest): 
        if D had tasks AND zero completions → write forfeit-loss   # computeForfeit 
        else → settle(userXP(D), rivalXP(D))                        # settle() 
    if any settled → redirect /showdown?day=latest 
    else           → Home 
  

7.5 Email Upgrade ("Lock in your progress") 

Triggers: immediately after first win (peak positive moment) + once on Day 3 + always available in Settings. Max 2 unsolicited prompts, then silent forever. Flow: modal → enter email → magic link → updateUser converts anonymous ID in place → "Progress locked. Blaze can never take it." Toast. 

 

8. Edge-Case Flows 

Scenario 

Flow 

Grace Mode UX 

00:00–04:00: Home shows yesterday's list with banner "Grace period — Blaze is frozen. Finish strong." Completion-only (no edits). Today's view appears post-settlement. (Veto candidate — Decision 1) 

Absent 3 days 

Each day with tasks settles as forfeit-loss; rival levels up 3×; Showdown shows latest, gloats accordingly; calendar is a red patch — comeback badge bait 

Fully offline day 

Engine is pure/local → user XP tracked in queue, rival XP computed from clock → Showdown renders from local math → day_records writes on reconnect; PK dedupes 

Multi-device 

Device A settles at 07:00, Device B opens 07:05 → B's settlement check finds day_records row already exists → no-op → straight to Home. Zero conflict by constraint 

Timezone travel 

Settings change → warning modal ("Days settle in this timezone from now on") → future days use new tz; historical day values untouched 

Mid-day XP edit on existing task 

Raise XP 25→40 → target += k×15, toast confirms. Lower it → target unchanged, toast: "Blaze keeps his lead." (Extends PRD's ratchet to edits — Decision 4) 

Rest toggle after check-off 

Toggle hidden once ACTIVE. Sheet is the only path; no day can be both scored and rested 

 

9. Event & Notification Flow 

Event 

M2 (in-app toast) 

M3 (push via pg_cron → Edge Function → VAPID) 

Hourly rival tick 

Random ~30% chance, seeded 

— 

Overtake 

Guaranteed + haptic + red flash 

Best-effort hourly check: Edge Function recomputes rival XP vs task_logs XP; exact-moment precision impossible server-side, in-app toast covers precision 

9 PM trailing 

In-app toast if open 

Push: "Blaze leads by N. Your move." 

Morning prompt 

— 

Push at user-set time: "New day. New race. Blaze is at 0 — stay ahead." 

Settlement 

Showdown route (never a push — the reveal lives in-app) 

Post-MVP: "Blaze won while you were away." 

All taunt/notification strings live in /engine/taunts.ts + /strings/ per TRD — no hardcoded copy in components. 

 

10. Flow → Build Mapping (suggested M1 build order) 

Build step 

Deliver flow 

Touches 

1 

Onboarding steps 0–5 

Supabase anonymous auth, /onboarding, trigger migration 

2 

Task CRUD + normal check-off (§7.1) 

Home list, Add sheet, task_logs writes 

3 

Live race 

/engine/rival.ts + Race Module, seeded events, overtake toast 

4 

Settlement + Showdown (§7.4) 

settle, computeForfeit, day_records, /showdown 

5 

Grace Mode + Rest Day (§7.3) 

inGraceWindow, state machine transitions 

6 

History + Rival Hub 

Derived reads, customization writes 

7 

M2 layer: timer, toasts, sprites, SFX, Serwist offline 

§7.2, §9 

8 

M3: pushes, badges, Playwright 

§9 

 

Decisions to Veto 

Grace Mode shows yesterday, completion-only — alternative: keep showing today and silently credit yesterday (more confusing, less exploit-proof). 

Rest Day locks at first check-off — alternative: allow anytime but zero-out earned XP (feels punitive and weird). 

Difficulty/archetype changes apply tomorrow — alternative: instant (would let users lower k mid-loss; breaks fairness). 

XP ratchet extends to edits of existing tasks, not just add/delete — PRD was silent here; I generalized its own rule. 

Undo check-off allowed until settlement — alternative: no undo (simpler, but one fat-finger ruins a day and users churn). 

"Mathematically lost" state is visible but gentle — alternative: hide it entirely until Showdown (preserves hope, risks feeling rigged when the loss lands). 

Showdown is in-app lazy, never pushed — the morning reveal is a retention moment; a push would spend it. 

Email upgrade prompts: after first win + Day 3 only — alternatives (immediately, or every day) damage trust/retention respectively. 

 