import { formatInTimeZone } from 'date-fns-tz';
import { localDayKey } from './day';
import type { DayConfig, Difficulty } from './types';
export function rivalTarget(peak: number,k: Difficulty): number { return Math.floor(Math.max(0,peak)*k); }
export function hash(seed: string): number { let n=2166136261; for(const c of seed){n^=c.charCodeAt(0);n=Math.imul(n,16777619);} return n>>>0; }
/** Each hourly increment has a seeded weight; normalizing all 18 buckets preserves the exact midnight target. */
export function rivalEvents(target: number,day: string,userId: string): {hour:number;xp:number;total:number;tauntId:number}[] {
 const weights=Array.from({length:18},(_,i)=>80+hash(`${userId}:${day}:${i}`)%41); const sum=weights.reduce((a,b)=>a+b,0); let weight=0,previous=0;
 return weights.map((w,i)=>{weight+=w; const total=i===17?target:Math.floor(target*weight/sum); const event={hour:i+7,xp:total-previous,total,tauntId:hash(`${day}:${userId}:${i}:taunt`)}; previous=total; return event;});
}
export function rivalXPAt(target: number,now: Date,day: Pick<DayConfig,'key'|'timezone'|'isRest'>,userId='local'): number {
 if(day.isRest) return 0;
 const key=localDayKey(day.timezone,now); if(key>day.key) return target; if(key<day.key) return 0;
 const hour=Number(formatInTimeZone(now,day.timezone,'H'));
 return rivalEvents(target,day.key,userId).filter(e=>e.hour<=hour).at(-1)?.total??0;
}
export function race(userXP: number,rivalXP: number,remaining: number,isRest=false): {label:string;state:'lead'|'behind'|'tied'|'rest'|'lost'} {
 if(isRest)return {label:'Rest day. Both rivals recharge.',state:'rest'};
 const gap=userXP-rivalXP;
 if(gap<0&&remaining<-gap)return {label:'Your rival has this one. Tomorrow is a fresh start.',state:'lost'};
 return {label:gap>0?`Lead by ${gap} XP`:gap<0?`Behind by ${-gap} XP`:'Level pegging. Your move.',state:gap>0?'lead':gap<0?'behind':'tied'};
}
