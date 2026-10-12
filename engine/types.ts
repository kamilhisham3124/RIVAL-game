export type DayKey = string;
export type Difficulty = 0.5 | 0.6 | 0.75 | 0.9;
export type Archetype = 'blue' | 'sensei' | 'machine';
export type Result = 'win' | 'loss' | 'draw' | 'rest';
export type Schedule = 'daily' | 'weekdays' | 'custom' | 'once';
export type Category = 'study' | 'fitness' | 'health' | 'life';
export interface Task { id: string; title: string; xp: number; schedule: Schedule; days: number[]; onceDay: DayKey; focusMinutes: number; category: Category; active: boolean; createdDay: DayKey }
export interface TaskLog { taskId: string; title: string; xp: number; completedAt: string }
export interface DayConfig { key: DayKey; timezone: string; k: Difficulty; peakXP: number; isRest: boolean; tasks: Task[]; logs: TaskLog[]; focus: Record<string, { remaining: number; startedAt: number | null; ready: boolean }>; archetype: Archetype }
export interface DayRecord { day: DayKey; timezone: string; userXP: number; rivalXP: number; target: number; result: Result; forfeit: boolean; plannedXP: number; logs: TaskLog[]; seen: boolean; archetype: Archetype }
export interface Rival { name: string; sprite: 'blaze' | 'byte' | 'moss'; palette: 'ember' | 'violet' | 'mint'; archetype: Archetype; k: Exclude<Difficulty,0.5>; pending?: { day: DayKey; k: Exclude<Difficulty,0.5>; archetype: Archetype } }
export interface Game { version: 1; playerId: string; playerName: string; timezone: string; firstDay: DayKey; onboarding: boolean; tasks: Task[]; days: Record<DayKey,DayConfig>; records: DayRecord[]; rival: Rival; theme: 'system'|'light'|'dark'; legibility: boolean; sound: boolean }
