import { describe, expect, it } from 'vitest';
import {
  activeDayKey,
  computeForfeit,
  inGraceWindow,
  localDayKey,
  ratchet,
  settle,
} from '../engine/day';
import { rivalEvents, rivalTarget, rivalXPAt } from '../engine/rival';
import {
  advance,
  canRest,
  currentDay,
  editTasks,
  finishOnboarding,
  newGame,
  restDay,
  timerReady,
  toggleTask,
  toggleTimer,
} from '../engine/game';
import { levelFromXP, progression } from '../engine/progression';
import type { Task } from '../engine/types';
const now = new Date('2026-03-07T12:00:00Z');
const task: Task = {
  id: 'one',
  title: 'Study',
  xp: 25,
  schedule: 'daily',
  days: [],
  onceDay: '2026-03-07',
  focusMinutes: 0,
  category: 'study',
  active: true,
  createdDay: '2026-03-07',
};
const game = () => finishOnboarding(newGame(now, 'UTC', 'test'), [task], now);
describe('calendar and grace', () => {
  it('handles DST spring forward and fall back without moving the calendar day', () => {
    for (const iso of ['2026-03-08T06:59:00Z', '2026-03-08T07:01:00Z'])
      expect(localDayKey('America/New_York', new Date(iso))).toBe('2026-03-08');
    for (const iso of ['2026-11-01T05:30:00Z', '2026-11-01T06:30:00Z'])
      expect(localDayKey('America/New_York', new Date(iso))).toBe('2026-11-01');
  });
  it('uses local dates east of UTC', () =>
    expect(localDayKey('Asia/Kolkata', new Date('2026-03-07T20:00Z'))).toBe('2026-03-08'));
  it('closes grace at precisely 04:00', () => {
    expect(inGraceWindow(new Date('2026-03-08T03:59Z'), 'UTC')).toBe(true);
    expect(inGraceWindow(new Date('2026-03-08T04:00Z'), 'UTC')).toBe(false);
    expect(activeDayKey('UTC', new Date('2026-03-08T02:00Z'), true)).toBe('2026-03-07');
  });
  it('freezes yesterday tasks but permits late completion', () => {
    const t = new Date('2026-03-08T01:00Z');
    let g = advance(game(), t);
    expect(currentDay(g, t)).toBe('2026-03-07');
    g = editTasks(g, [], t);
    expect(g.days['2026-03-07'].tasks).toHaveLength(1);
    g = toggleTask(g, 'one', t);
    expect(g.days['2026-03-07'].logs).toHaveLength(1);
    expect(g.records).toHaveLength(0);
    expect(advance(g, new Date('2026-03-08T04:00Z')).records[0].result).toBe('win');
  });
});
describe('rival rules', () => {
  it('calibrates day one at k=.5', () =>
    expect(rivalTarget(game().days['2026-03-07'].peakXP, 0.5)).toBe(12));
  it('ratchets on add and retains peak after delete', () => {
    expect(ratchet(25, [task, { ...task, id: 'two', xp: 40 }])).toBe(65);
    expect(ratchet(65, [task])).toBe(65);
    let g = editTasks(game(), [{ ...task, xp: 50 }], now);
    g = editTasks(g, [], now);
    expect(g.days['2026-03-07'].peakXP).toBe(50);
  });
  it('hourly jitter is deterministic, monotonic and reaches exact target', () => {
    const events = rivalEvents(180, '2026-03-07', 'a');
    expect(events).toEqual(rivalEvents(180, '2026-03-07', 'a'));
    expect(events.reduce((s, e) => s + e.xp, 0)).toBe(180);
    expect(events.every((e) => e.xp >= 0)).toBe(true);
    const d = game().days['2026-03-07'];
    expect(rivalXPAt(180, new Date('2026-03-07T05:59Z'), d)).toBe(0);
    expect(rivalXPAt(180, new Date('2026-03-08T01:00Z'), d)).toBe(180);
    expect(rivalXPAt(180, now, { ...d, isRest: true })).toBe(0);
  });
  it('resolves wins losses and ties', () => {
    expect(settle(25, 20)).toBe('win');
    expect(settle(0, 20)).toBe('loss');
    expect(settle(20, 20)).toBe('draw');
  });
  it('detects forfeits only when tasks existed', () => {
    expect(computeForfeit([task], [])).toBe(true);
    expect(computeForfeit([], [])).toBe(false);
  });
});
describe('lifecycle', () => {
  it('settles missed days once and leaves no-task days unpunished', () => {
    const t = new Date('2026-03-10T08:00Z');
    const g = advance(game(), t);
    expect(g.records).toHaveLength(3);
    expect(g.records.every((r) => r.forfeit)).toBe(true);
    expect(advance(g, t).records).toEqual(g.records);
    const empty = finishOnboarding(newGame(now, 'UTC', 'a'), [], now);
    expect(advance(empty, t).records).toHaveLength(0);
  });
  it('undo lowers earned XP without lowering peak', () => {
    let g = toggleTask(game(), 'one', now);
    expect(g.days['2026-03-07'].logs).toHaveLength(1);
    g = toggleTask(g, 'one', now);
    expect(g.days['2026-03-07'].logs).toHaveLength(0);
    expect(g.days['2026-03-07'].peakXP).toBe(25);
  });
  it('rest is unavailable after completion and only once per rolling week', () => {
    expect(canRest(toggleTask(game(), 'one', now), '2026-03-07')).toBe(false);
    let g = restDay(game(), now);
    g = advance(g, new Date('2026-03-08T08:00Z'));
    expect(g.records[0].result).toBe('rest');
    expect(canRest(g, '2026-03-08')).toBe(false);
  });
  it('deleting all tasks does not evade a forfeit', () => {
    const g = editTasks(game(), [], now);
    const settled = advance(g, new Date('2026-03-08T08:00Z'));
    expect(settled.records[0].result).toBe('loss');
    expect(settled.records[0].forfeit).toBe(true);
  });
  it('undo cannot unlock a rest day', () => {
    let g = toggleTask(game(), 'one', now);
    g = toggleTask(g, 'one', now);
    expect(canRest(g, '2026-03-07')).toBe(false);
  });
  it('focus lock survives pauses and tab absence', () => {
    const t = { ...task, focusMinutes: 1 };
    let g = finishOnboarding(newGame(now, 'UTC', 'a'), [t], now);
    g = toggleTask(g, 'one', now);
    expect(g.days['2026-03-07'].logs).toHaveLength(0);
    g = toggleTimer(g, 'one', now);
    expect(timerReady(g.days['2026-03-07'], 'one', now.getTime() + 59000)).toBe(false);
    expect(timerReady(g.days['2026-03-07'], 'one', now.getTime() + 60000)).toBe(true);
    g = toggleTask(g, 'one', new Date(now.getTime() + 60000));
    expect(g.days['2026-03-07'].logs).toHaveLength(1);
  });
  it('levels use the required curve', () => {
    expect(levelFromXP(125)).toMatchObject({ level: 2, xp: 0, next: 150 });
    expect(levelFromXP(0).level).toBe(1);
    expect(progression([]).streak).toBe(0);
  });
});
