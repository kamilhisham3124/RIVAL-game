PRD: RIVAL — Habit RPG With an AI Nemesis
Project Overview:
RIVAL is a gamified, pixel-art habit tracker where users compete daily against a customizable AI rival. Users define daily tasks (e.g., "Study calculus 50 min," "Drink 8 glasses of water," "Gym 1 hr") with XP values. Completing tasks earns XP; simultaneously, the rival accrues XP continuously throughout the day on a visible progress bar. At midnight, the scores settle in a Pokémon-style "Showdown" screen: win, lose, or draw. The rival talks trash, levels up, evolves its sprite, and remembers your losses. The emotional hook is loss aversion — watching the rival pull ahead in real time is more motivating than any streak counter.

Working codename: RIVAL (placeholder — rename freely).

Level:
Easy to Medium

Type of Project:
Gamified Productivity App, Mobile-First Web App (PWA), Game Design, Pixel-Art UI

Skills Required:
Next.js (or React) + Tailwind CSS
Supabase or Firebase (auth, database)
Basic game-economy math (XP curves, difficulty scaling)
Pixel-art sprite assets (Kenney.nl or itch.io free packs — original art only, no Nintendo assets)
State management (Zustand or React Context — light footprint)
Game Design: The Four Questions
1. What is the game?
A daily 1v1 race between you and your AI rival. The rival represents the version of you that never slacks. Every day is a match; every week is a season; every loss makes the rivalry personal. It is self-competition wearing an RPG skin.

2. How do I play the game?
Morning (or night before): Review today's task list. Each task has an XP value.
All day: Complete tasks → tap to check off → earn XP. The rival's XP bar ticks up continuously in the background, visible on the home screen as a live race.
Check-ins: Push notifications/toasts when the rival overtakes you, completes a "training session," or gloats.
Midnight — The Showdown: A battle screen compares final XP. Win = your streak grows, you level up, rival sulks. Loss = rival gloats, gains prestige.
Repeat. Streaks, levels, badges, and the rivalry itself compound over time.
3. What are the patterns behind the game?
Loss aversion: Losing XP potential to a watchable opponent stings more than a missing checkbox motivates. This is the core engine.
Goal gradient effect: As the rival nears your score, effort spikes. The live bar creates a finish-line-you-can-see all day long.
Implementation intentions: Pre-committing tasks the night before (with XP stakes) dramatically increases follow-through vs. deciding in the moment.
Fresh-start effect: Daily reset gives a clean slate every 24 hours — failure is never permanent.
IKEA effect / identity: Customizing the rival (name, sprite, personality) makes the opponent yours, which makes beating them meaningful. The rival is an emotional investment.
Streak sunk cost: Win streaks create a reason to show up on low-motivation days.
Variable social feedback: Rival taunts arrive unpredictably (task completion, overtake events, morning, showdown), mimicking the reward schedule of a social feed.
4. How do I excel at the game?
Set 3–5 meaningful tasks, not 15 tiny ones. XP threshold math (below) means a bloated list raises the bar you must clear.
Front-load. The rival accrues all day; completing tasks before evening keeps you ahead on the bar, which compounds motivation.
Protect the streak with one "gimme" task. A guaranteed easy 10 XP task ensures bad days are narrow losses, not forfeits.
Right-size XP honestly. Overvaluing easy tasks only raises the rival's target (see The Rival Rule).
Use Rest Days strategically (one per week — see mechanics) instead of breaking streaks.
Core Mechanics & XP Economy
The Rival Rule (the balancing invariant)
At any moment, the rival's end-of-day XP target = k × (total XP available to you today).

The rival doesn't have its own task list — it scales to your ambition. If you plan 240 XP worth of tasks, the rival will have earned k × 240 by midnight. You beat the rival by completing more than k% of your planned XP. This makes the game self-balancing no matter how many tasks the user sets.

Difficulty presets (user-selectable):

Rival Difficulty
k
You win if you complete...
Chill	0.60	> 60% of planned XP
Rival (default)	0.75	> 75% of planned XP
Nightmare	0.90	> 90% of planned XP

Accrual: Rival XP accrues linearly across 24h in visible hourly chunks with slight jitter ("Blaze finished a set! +12 XP"). Tuning knob: restrict accrual to waking hours (6am–midnight) so users aren't demoralized at breakfast.

Worked example (k = 0.75, five tasks totaling 240 XP):

Rival target: 180 XP, ticking ~7.5 XP/hour.
8:00 PM: rival has ~150 XP. You've completed 120 XP. Toast: "Blaze leads by 30. Embarrassing."
You finish one more 40 XP task → 160 vs 161. Nail-biter.
You finish one more → win by 39. Showdown screen plays your victory.
Task XP defaults (user-overridable): ~1 XP per 2 minutes of effort, minimum 10. Study 50 min = 25 XP · Gym 1 hr = 30–40 XP · 8 glasses water = 15 XP · Meditation 10 min = 10 XP.

Other mechanics
Focus Timer (anti-cheat + engagement): Tasks can be marked "Focus" (study, gym, deep work). Check-off is locked until an in-app countdown finishes. Non-timer tasks (water, chores) are honor-system taps.
Levels: User levels on a gentle curve (XP to next level = 100 + 25 × current level). Sprite evolves every 5 levels — new pixel outfit/gear (Red-style cap → jacket → etc.).
Rival leveling: The rival also levels from its XP — including on days you lose. A neglected rival becomes visibly stronger and smugger. Anti-death-spiral rule: rival level is cosmetic prestige only; difficulty k is controlled solely by the user.
Streaks & Badges: Consecutive win counter. Badges: First Blood (first win), Perfect Day (100%), Comeback (won after trailing at 8 PM), Week Warrior (7-day streak), etc.
Rest Day: One per week. Toggle before the day starts — rival also rests, no XP either side, streak freezes.
Showdown Screen: End-of-day battle UI with round-by-round recap log ("8:14 AM — You completed 'Gym' +35!" ... "11:02 PM — Blaze finished training. +12"). Losses get trash talk; wins get grudging respect.
Rival personalities (archetypes): The Blue (cocky trash-talk), The Sensei (calm, disappointed), The Machine (cold statistics). Each archetype = a taunt template bank + dialogue tone. Customizable: name, sprite, color palette, archetype, difficulty.
Implementation note (big vibe-coding shortcut):
Rival XP is a pure deterministic function of elapsed time: rivalXP = min(target, target × hoursElapsed/24). No server cron jobs, no background workers needed for MVP — the client computes it on render. Day results are stored once per day on first open after midnight.

Key Features
Milestone 1: Core Loop (the playable game)
Auth (email or anonymous + upgrade)
Task CRUD: title, XP value, schedule (daily / weekdays / specific days / one-off), Focus flag, category icon
Check-off flow + XP award
Deterministic rival accrual + live dual progress bar
Midnight resolution → Showdown screen → day_records written
Rest Day toggle
Milestone 2: Game Feel
Pixel-art home screen: user sprite vs. rival sprite, animated XP bars
Rival customization screen (sprite selection, palette, name, archetype, difficulty)
Taunt toast system (template bank per archetype per event)
Focus Timer with locked check-off
Showdown battle screen with recap log + sound effects (free retro SFX packs)
Milestone 3: Progression & Retention
User levels + sprite evolution (outfit changes every 5 levels)
Rival levels + rival sprite evolution
Streaks, badge system, history calendar (win/loss color-coded)
Onboarding: pick & name rival → set first 3 tasks → "Calibration Day 1" at k = 0.5 so the first win is nearly guaranteed
Local push notifications (rival overtake events, morning prompt, 9 PM warning)
Post-MVP (do NOT build yet):
LLM-generated dynamic trash talk (MVP uses templates — deterministic, free, offline-safe)
Weekly Championships, rival roster tiers ("Gym Badge" ladder of progressively harder rivals)
Friend rivals / leaderboards, leagues
AI task suggestions, wearable integration, widgets, sprite marketplace
Data Model (minimal)
users — id, timezone, level, xp_total, streak, settings
rivals — id, user_id, name, sprite_ref, palette, archetype, difficulty_k, rival_level
tasks — id, user_id, title, xp, schedule_type, focus_flag, active
task_logs — id, task_id, date, completed_at, xp_awarded
day_records — id, user_id, date, user_xp, rival_xp, rival_target, result
Edge Cases & Rules (decide these now, thank yourself later)
Midnight reset: Day boundary = user's local midnight, stored per-user timezone.
Task edits mid-day: Adding tasks raises the rival's locked target by k × new task XP (keeps The Rival Rule intact). Deleting tasks never lowers the rival's target (prevents "complete easy stuff, delete hard stuff" exploit). Rule: rival target = k × peak planned XP for the day.
Missed day: If tasks existed and zero were completed → recorded forfeit loss, streak resets, rival gloats and levels. If no tasks existed → no record, no punishment.
Tie: Draw. Streak preserved but not incremented. Rival is insufferable about it.
Grace window: Completions between 12:00–4:00 AM count for the previous day (night-owl protection).
Success Metrics (MVP)
Activation: % of new users who create ≥3 tasks AND complete ≥1 task on Day 1 (target: 60%)
D7 retention (target: 25%+)
Average task completion rate (target: 55–65% — below that feels unwinnable, above feels too easy)
% of active users on a 3+ day streak (target: 30%)
Product Owner & Vision:
Solo builder vibe-coding the MVP. Vision: prove that a visible, personalized, slightly mean rival creates habit adherence that streak counters can't. Success = users who open the app specifically to check on their rival.

Decisions I Made — Veto Any of These
Rival scales to your ambition (k × your planned XP) rather than a fixed XP rate — this solves the exact balance problem you flagged. Fixed rates break when users add/remove tasks.
Template taunts, not LLM calls, for MVP (free, instant, offline) — LLM trash talk is Post-MVP.
Rival levels even when it loses (cosmetic only) — makes the rivalry feel alive without creating a death spiral.
Ties = draws, not rival wins (kinder; the rival gloats anyway).
One Rest Day per week — burnout is the #1 killer of habit apps.