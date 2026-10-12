import { formatInTimeZone } from 'date-fns-tz';
import type { DayKey, Result, Task, TaskLog } from './types';
export function localDayKey(tz: string, now: Date): DayKey { return formatInTimeZone(now, tz, 'yyyy-MM-dd'); }
export function localHour(tz: string, now: Date): number { return Number(formatInTimeZone(now,tz,'H')); }
export function inGraceWindow(now: Date, tz: string): boolean { return localHour(tz,now) < 4; }
export function shiftDay(key: DayKey, amount: number): DayKey { const d = new Date(key+'T12:00:00Z'); d.setUTCDate(d.getUTCDate()+amount); return d.toISOString().slice(0,10); }
export function weekday(key: DayKey): number { return new Date(key+'T12:00:00Z').getUTCDay(); }
export function scheduled(task: Task, day: DayKey): boolean { if(!task.active || task.createdDay > day) return false; const w=weekday(day); return task.schedule==='daily' || (task.schedule==='weekdays' && w>0 && w<6) || (task.schedule==='custom' && task.days.includes(w)) || (task.schedule==='once' && task.onceDay===day); }
export function settle(userXP: number,rivalXP: number): Exclude<Result,'rest'> { return userXP>rivalXP?'win':userXP<rivalXP?'loss':'draw'; }
export function computeForfeit(tasks: Task[],logs: TaskLog[]): boolean { return tasks.length>0 && logs.length===0; }
export function plannedXP(tasks: Task[]): number { return tasks.reduce((n,t)=>n+t.xp,0); }
export function earnedXP(logs: TaskLog[]): number { return logs.reduce((n,l)=>n+l.xp,0); }
export function ratchet(peak: number,tasks: Task[]): number { return Math.max(peak,plannedXP(tasks)); }
export function activeDayKey(tz: string,now: Date,hasUnsettledYesterday: boolean): DayKey { const today=localDayKey(tz,now); return inGraceWindow(now,tz)&&hasUnsettledYesterday?shiftDay(today,-1):today; }
