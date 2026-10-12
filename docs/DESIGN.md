UI/UX & DESIGN DOCUMENTATION: RIVAL 

Design language codename: "Cartridge" — Apple-grade clarity, discipline, and accessibility applied to a pixel-art game. Companion to the PRD, TRD, and App Flow. This document is the single source of truth for every visual decision your build tool makes. 

 

1. Design Philosophy & the Legal Boundary 

1.1 Three Pillars (Apple's HIG themes, translated) 

Apple Pillar 

Cartridge Translation 

Clarity 

Text is legible first, stylish second. Every icon has a label or accessible name. The user's tasks are the hero; chrome recedes. Pixel fonts are rationed — decoration never carries information. 

Deference 

The UI never competes with content. Frosted blur → flat translucent fills. Gradients → 2–3 step dither bands. Soft shadows → hard pixel offsets. The design system disappears so the race between you and your rival is the only thing on screen. 

Depth 

Hierarchy through layering, not blur: base → surface → raised → floating (sheets), each with a defined pixel elevation token. Modal experiences (Focus Timer, Showdown) feel like physical layers sliding over the game board. 

1.2 What We Take vs. What We Never Take (non-negotiable) 

✅ Take (design principles & patterns — not copyrightable) 

❌ Never Take (protected assets & marks) 

Layout grammar: large collapsing titles, inset-grouped lists, bottom sheets, segmented controls, tab-bar→sidebar adaptivity 

SF Pro / SF Compact / New York fonts 

Interaction grammar: swipe actions, pull-to-refresh, spring-ish sheet presentation, ESC/scrim dismissal 

SF Symbols (we use Pixelarticons, per TRD) 

Accessibility discipline: 44pt targets, Dynamic-Type-style scaling concept, reduced-motion respect, high contrast 

Apple's exact system color values (e.g., their system blue) 

Copy voice in chrome: terse, sentence case, zero exclamation marks 

Apple artwork, product imagery, "Dynamic Island"-style clones 

Theme behavior: instant light/dark/system switching 

Any use of "Apple", "iOS-style", or Cupertino references in the product UI or store/marketing listings 

The one-line rule: We copy Apple's discipline, never Apple's assets. 

1.3 The Fusion Rule (resolves the pixel-vs-Cupertino tension) 

Chrome speaks Apple. The game speaks arcade. 

Navigation, settings, forms, history — restrained, quiet, Apple-clean. Sprites, XP bars, taunts, Showdown — loud, 8-bit, alive. Every screen declares which mode it's in, and never mixes tones within one component. 

 

2. Theming System (light · dark · system) 

Architecture: semantic CSS custom properties — components never reference raw hex. system (default) resolves via prefers-color-scheme; user override writes data-theme. 

:root { /* light tokens */ } 
@media (prefers-color-scheme: dark) { 
  :root:not([data-theme="light"]) { /* dark tokens */ } 
} 
[data-theme="dark"] { /* dark tokens */ } 
  

Rules: 

Theme switch is instant — no crossfade (Decision 6). 

Every component specifies both themes; nothing ships light-only. 

Sprites use theme-aware palette swaps for outlines/shadows (sprite core art constant); the rival's identity palette never changes with theme. 

The Showdown stage is always dark in both themes (Decision 3) — media experiences go edge-to-edge dark; flash effects and the arena need the contrast floor. 

 

3. Color Tokens 

Neutrals are warm-tinted (paper in light, warm CRT in dark) to marry the Apple-clean surface with retro warmth (Decision 7). All pairs below target ≥ 4.5:1 (text) / ≥ 3:1 (graphics); CI axe-core contrast tests are the source of truth — if a pair fails, raise lightness, never abandon the palette (TRD rule). 

Token 

Light 

Dark 

Used for 

bg 

#F4F2EA 

#14130E 

Page base 

surface 

#FFFFFF 

#1F1D15 

Cards, sheets, tab bar 

surface-2 

#ECE9DE 

#2A271C 

Insets, fills, input wells 

label 

#191813 

#F1EDDD 

Primary text 

label-2 

#57544A 

#ABA692 

Secondary text 

label-3 

#8A867A 

#7B7666 

Disabled/decorative only (fails 4.5:1 by design — never for information) 

separator 

#D9D5C7 

#3D3929 

Hairlines, borders 

accent (interactive) 

#2F5FD0 

#8FA8FF 

Links, selection, focus ring — deliberately distinct from any Apple system blue 

xp-green fill / text 

#4FBF63 / #256B31 

#63D077 / #8CE49D 

Your XP bar, win states 

rival-red fill / text 

#E1544A / #A93226 

#EF6E63 / #F4A29A 

Rival XP bar, loss states 

streak-orange 

#F0A03C / #96590F 

#F5A94F / #FFC98A 

Streak flame, 9 PM warning 

gold 

#E3B93E / #7A5E0A 

#E8C25A / #F2D98C 

Levels, badges, evolution 

Colorblind safety (mandatory): XP-green vs rival-red alone must never encode meaning. Therefore: the rival bar always carries a diagonal dither/hatch pattern while yours is solid (Decision 5); Lead/Behind is always spelled in text; calendar W/L/D uses glyphs (▲ ▼ ●) plus lightness-separated fills. 

Gradient ban: no CSS gradients anywhere. Depth transitions use stepped dither bands. This is where Apple's sheen translates into pixel craft. 

 

4. Typography 

Press Start 2P (display) and VT323 (body), per TRD — but governed by Apple's type-role discipline (semantic styles, one scale, no ad-hoc sizes). 

Role 

Font 

Size / line-height 

Usage 

display 

Press Start 2P 

24px / 1.33 (3× base) 

"TODAY" large title, VICTORY/DEFEAT banner 

title-1 

Press Start 2P 

16px / 1.5 

Screen large titles (HISTORY, RIVAL), rival name 

title-2 

Press Start 2P 

8px / 1.6 

Section headers, card titles, tab labels 

body 

VT323 

20px / 1.4 

Task titles, dialogue text, list content 

callout 

VT323 

18px / 1.45 

Secondary rows, sheet body 

footnote / caption 

VT323 

16px / 1.4 

Stats captions, timestamps, legal 

numeric 

Press Start 2P 

8/16px 

XP counters — monospaced digits, never reflow 

Hard rules: PS2P renders only at 8px multiples (8/16/24/32) — never 12, never 14 (Decision 8). VT323 floor is 16px. PS2P is never used for sentences longer than two lines (dialogue is VT323). Tabular numbers everywhere XP is displayed. 

Legibility Mode (Settings toggle, M2+): swaps VT323 body → system font stack for users who need maximum readability — the per-app text-control philosophy, implemented with zero Apple assets (Decision 4). Pixel headings remain. 

 

5. Spatial System 

Grid: 4px base (s1=4 → s9=48). Screen margins: 16px mobile, 24px ≥768. Card padding 16px. List row height 56px. Everything snaps to grid — no odd offsets. 

Radius (pixel-stepped, no true curves): r0 sharp (buttons, bars) · r2 2px corner-step (inputs, small chips) · r4 4px two-step (cards, sheets). One system, three values — never mix rounded and sharp on the same component tier. 

Elevation (hard offsets, zero blur): 

Token 

Spec 

Used by 

flat 

2px separator border 

List rows, inset groups 

raised 

border + 0 2px 0 rgb(0 0 0 / .12) 

Cards, tab bar 

floating 

border + 4px 4px 0 rgb(0 0 0 / .2) 

Sheets, FAB, toasts, dialogue boxes 

pressed 

translateY(2px) + shadow removed 

Any pressable, on :active 

bevel 

inset top highlight + inset bottom shade 

XP bars, game tiles only 

Separators: 1px separator; pixel dither variant for in-game lists only. 

 

6. Responsive & Device Strategy 

Breakpoint 

Width 

Nav 

Layout 

xs 

320–389 

Bottom tab bar (icons only) 

Single column 

sm (base) 

390–767 

Bottom tab bar, labeled 

Single column, max 640 centered 

md 

768–1023 

Tab bar persists 

Two-panel where natural (Rival hub: sprite left, options right); Showdown exploits landscape (VS layout) 

lg 

1024+ 

Left sidebar (Apple adaptive pattern) 

Dashboard: race module + task list + 7-day history strip in a 1200px grid 

Platform behaviors: env(safe-area-inset-*) respected on all sides (notched iPhones); maskable app icon + themed PWA splash (bg token + logo, nothing else); 44×44px minimum targets at every breakpoint; hover states only on pointer-fine devices (pixel hover = shadow grows 2px); Showdown screen-shake disabled under prefers-reduced-motion. 

 

7. Navigation Design 

Mobile: bottom tab bar — Today · History · Rival · Settings — pixel icons + 8px PS2P labels, raised elevation, active tab = accent fill + pressed sprite frame. This adds persistent nav to the App Flow's hub-and-spoke (Decision 1); the gear shortcut and all routes/guards are unchanged. 

Desktop: same four destinations as a sidebar, plus contextual shortcuts (⌘/Ctrl+N new task). 

Large collapsing titles on Today & History: display/title-1 shrinks to inline compact header on scroll; 1px separator appears at the collapse boundary — the Apple header behavior, rendered in pixels. 

Sheets: bottom sheet with grabber on mobile → centered floating card ≥768 (Apple's page-sheet-to-popover adaptivity). All modals: scrim rgb(0 0 0 / .5), ESC + scrim-tap dismiss, focus trapped. 

 

8. Motion & Haptics 

Token 

Value 

Easing 

instant 

0ms 

state flips (theme, check state) 

fast 

120ms 

presses, toggles — steps(2) 

base 

200ms 

sheets, bars — cubic-bezier(.2,.8,.2,1) (spring approximation) 

slow 

320ms 

screen transitions 

showdown beats 

400/600/900ms 

VS slam → bars fill → banner 

Sprites animate with steps(N) frame loops (idle bounce = 2 frames @ 500ms). 

XP tick: number pops 1 frame + bar steps(8) fill — the bar move is always paired with a text/number change (never motion-only information). 

Reduced-motion contract (from TRD): no bounce, no shake, no fill animation — values still update instantly; Showdown becomes a static recap card. 

Haptics (progressive enhancement — Android web only; iOS Safari lacks the API, silent no-op, Decision 9): check-on [12], overtake warning [10,60,10], level-up [15,40,15,40,30], rest confirm [8]. 

 

9. Component Library 

Component 

Anatomy 

States 

Key specs & a11y 

PixelButton 

PS2P title-2 label, r0, 2px border 

default / hover / pressed / disabled / destructive 

Real <button>; press = sink; destructive = rival-red text; min 48px height 

TaskRow 

icon · title (body) · XP chip · focus-clock · check circle 

default / completed (grey + strike) / locked (Focus) 

Check = <button aria-pressed>; swipe L: Edit/Delete (Delete = confirm sheet, Apple-list grammar); full-row target 56px 

XPBar (race) 

dual bars + sprites + gap label 

leading / trailing / grace / lost / rest 

Yours solid green, rival's hatched red; label always textual ("LEAD BY 40"); role="status" live region announces overtake once 

Sheet 

grabber · title · content · actions 

open/closing 

Focus trap, aria-modal, ESC/scrim close 

SegmentedControl 

pixel tabs in inset well 

selected = surface + bevel 

role="tablist"; used for difficulty, schedule type, archetype 

InsetGroupList 

grouped rows on surface, flat separators 

— 

Settings, Rival hub options; chevron affordance on navigable rows 

DialogueBox 

rival speech: floating elevation, double border, VT323 text, sprite portrait 

typed (typewriter steps()) / static 

aria-live="polite"; skip-typewriter on tap 

Toast 

floating chip, icon + one line 

info / taunt / warning 

4s auto-dismiss, swipe-dismiss, never blocks targets 

FocusTimerSheet 

big numeric countdown, ring of pixel ticks, task name 

running / paused / complete (check unlocks + chime) 

Runs via local clock, survives tab switch; screen-reader announces minutes remaining each minute 

Calendar (History) 

month grid, W/L/D/REST glyph cells 

cell tap → detail sheet 

Glyph + color (not color alone); keyboard grid navigation 

Badge 

gold-framed pixel medallion + name 

locked (greyscale) / unlocked (bevel + shine frame) 

Unlock always celebrated in Showdown rewards panel, not just silently granted 

TextField / Stepper 

surface-2 well, r2, accent 2px focus ring 

default / focus / error 

Label always visible (never placeholder-as-label); stepper for XP in 5s increments 

EmptyState 

pixel illustration + one callout line + action 

per screen 

"Blaze is waiting. Plan your day." 

Spinner / Skeleton 

4-frame rotating sprite / dithered blocks 

loading 

Skeletons mirror final layout — no layout shift 

 

10. Screen-by-Screen Design Specs 

10.1 Today — / (the 90% screen) 

mobile (390)                      desktop (1280, sidebar omitted) 
┌──────────────────────────┐      ┌───────────────┬───────────────────────┐ 
│ TODAY          Lv 4 🔥12 │      │ RACE          │ TODAY        Lv 4 🔥12 │ 
│ ┌ RACE MODULE ─────────┐ │      │ you ▓▓▓▓▓░░ 160│ ┌───────────────────┐ │ 
│ │  [you]  ▓▓▓▓░░  LEAD 40│ │      │ vs            │ │ ☑ Gym 1hr    +35  │ │ 
│ │  [rival]▒▒▒░░░  20:41  │ │      │ rival ▒▒▒▒░ 161│ │ ☑ Water 8    +15  │ │ 
│ └───────────────────────┘ │      │ 7-day strip ▮▮▯│ │ ○ Calculus   +25 ⏱│ │ 
│ ○ Gym 1hr            +35 │      └───────────────┘ └───────────────────┘ │ 
│ ○ Water ×8           +15 │      FAB ──▶ sheet 
│ ◉ Calculus 50m   +25  ⏱  │ 
│ ＋ Add task               │ 
│ [Today][History][Rival][⚙]│ 
└──────────────────────────┘ 
  

Anatomy: collapsing large title + streak/level header → race module (raised, bevel bars, seed-ticking rival) → task list (inset group) → FAB. Rest shield sits in the race module, PLANNED-days only. 

Responsive: md widens rows; lg splits race + list into dashboard columns with the 7-day strip. xs drops tab labels, gap label shortens to "↑40". 

States: empty (template chips), grace banner ("Grace period — Blaze is frozen"), mathematically-lost (bars grey, "Blaze has this one." — no shaming), rest (both bars dimmed, shield filled). 

10.2 Showdown — /showdown (always-dark stage) 

┌──────────────────────────┐ 
│      [you]  VS  [rival]  │  ← sprites slam in (400ms), shake (600ms) 
│ ▓▓▓▓▓▓▓░░░  210          │ 
│ ▒▒▒▒▒▒░░░░  180          │  ← bars fill to truth (900ms) 
│ ┌ RECAP LOG ───────────┐ │ 
│ │ 8:14a You: Gym +35   │ │  ← VT323 feed, scrollable 
│ │ 11:02p Blaze: +12    │ │ 
│ └──────────────────────┘ │ 
│      ★ VICTORY ★         │  ← gold display type 
│ "…Fine. Today was yours."│  ← DialogueBox, archetype voice 
│ +210 XP ▓▓▓░ Lvl 5!      │  ← rewards: level bar, badges, streak 
│ [ Start today → ]        │ 
└──────────────────────────┘ 
  

Sequence timing locked to the showdown beats tokens; every beat also communicates via text so reduced-motion users get the full story statically. lg: sprites left/right of a center recap column. 

10.3 Rival Hub — /rival 

Large sprite preview (theme-aware outline) → inset groups: Identity (name, sprite picker, palette swatches), Personality (archetype segmented control, each card showing a sample taunt), Difficulty (segmented + the k→% table, "applies tomorrow" footnote in footnote), Record (W-L-D, level + evolution progress). Cosmetics apply instantly; rule-bound changes show a tomorow-bound confirmation. 

10.4 History — /history 

Streak header → month calendar (glyph+color cells, today outlined, REST dimmed) → detail sheet on tap (result banner, XP-vs-target bar pair, task log) → badges grid → totals row. Pure read-time rendering; no writes. 

10.5 Settings — /settings 

Pure Apple-grammar inset groups: Account (upgrade status, sign out), Timezone (warning modal), Notifications (M3: time pickers, toggles — pixel switches, role="switch"), Legibility Mode, Sound, Rival shortcut, Credits (from CREDITS.md), Danger Zone (destructive group, double confirm). 

10.6 Onboarding — 5 steps, one idea per screen, PS2P headline + VT323 body + single CTA; step dots as pixel pips; skippable-forward except rival name + first task; Back always available. 

Universal states (every screen): loading (skeleton), offline banner ("Queued — Blaze can't hide your work online or off"), error (dialogue-box styled, retry button), empty (per §9). 

 

11. Accessibility Specification 

Area 

Spec 

Contrast 

All pairs per §3; CI axe-core gate on every deploy 

Targets 

≥44×44 everywhere, ≥8px between adjacent targets 

Screen readers 

Check = aria-pressed; overtake = one polite announcement/day; race bars have text fallbacks; Showdown result is an h1 + live region 

Keyboard 

Full loop navigable; 2px accent :focus-visible ring, never removed; sheets trap + restore focus 

Type 

Legibility Mode toggle; layouts survive 200% browser zoom without horizontal scroll 

Motion 

TRD reduced-motion contract (§8) 

Color-independence 

§3 colorblind rules — glyph + pattern + text, always 

Sound 

Every SFX has a visual/tactile twin; global mute 

 

12. Design QA Checklist (paste into every build prompt) 

No gradients, no blur, no soft shadows — dither and hard offsets only. 

No raw hex in components — semantic tokens only. 

PS2P at 8px multiples only; VT323 ≥16px. 

Both themes specified for every new component; system default honored. 

4px grid snap; 44px targets; focus ring visible. 

Sprites: image-rendering: pixelated, integer scales (2×/3×/4×) only. 

Information never carried by color or motion alone. 

Chrome copy: sentence case, no exclamation marks; arcade copy lives only in taunts/dialogue. 

Reduced-motion path defined before merging any animation. 

New assets logged in CREDITS.md before first render. 

 

Decisions to Veto 

Bottom tab bar on mobile / sidebar on desktop — adds chrome the App Flow didn't specify; guards and routes unchanged. Alternative: keep header-only nav (more deferent, one more tap per swap). 

Desktop dashboard layout (multi-column Home) — alternative: phone-width column centered at all sizes (simpler build, wastes desktop). 

Showdown always dark in both themes — alternative: theme-following arena (cohesive, but kills flash contrast and drama). 

Legibility Mode — post-TRD addition; zero Apple assets used. Alternative: skip until user feedback demands it. 

Rival-bar hatch pattern — the colorblind signature. Alternative: lightness-only separation (weaker). 

Instant theme switching — Apple behavior. Alternative: 150ms crossfade (nicer, non-standard). 

Warm neutrals instead of pure grays — alternative: neutral gray (cleaner, more "generic app", less warm). 

PS2P locked to 8px multiples — guarantees crisp pixels; constrains intermediate heading sizes. 

Haptics realistically Android-only — honest platform constraint, silently absent elsewhere. 

 