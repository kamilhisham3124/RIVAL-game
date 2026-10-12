'use client';
import { Sprite } from './sprite';
import { Icon } from './icon';
import { earnedXP, plannedXP } from '@/engine/day';
import { race, rivalTarget, rivalXPAt } from '@/engine/rival';
import { progression } from '@/engine/progression';
import { useGame } from '@/store/game';
import { currentDay } from '@/engine/game';
import { taunt } from '@/engine/taunts';
export function Bar({
  label,
  value,
  max,
  rival = false,
}: {
  label: string;
  value: number;
  max: number;
  rival?: boolean;
}) {
  return (
    <div className={'xp-row ' + (rival ? 'rival-bar' : '')}>
      <div className="bar-heading">
        <span>{label}</span>
        <span>
          <strong>{value}</strong>
          <small> / {max} XP</small>
        </span>
      </div>
      <div
        className="bar-track"
        role="progressbar"
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={Math.max(max, value, 1)}
      >
        <div
          className="bar-fill"
          style={{ width: `${Math.min(100, (value / Math.max(max, 1)) * 100)}%` }}
        />
      </div>
    </div>
  );
}
export function Race({ now }: { now: Date }) {
  const g = useGame((s) => s.game)!;
  const day = g.days[currentDay(g, now)];
  const p = progression(g.records);
  if (!day) return null;
  const target = rivalTarget(day.peakXP, day.k),
    earned = earnedXP(day.logs);
  const rival = rivalXPAt(target, now, day, g.playerId);
  const status = race(earned, rival, Math.max(0, plannedXP(day.tasks) - earned), day.isRest);
  return (
    <section className={'race-card ' + status.state} aria-label="Live daily race">
      <div className="card-top">
        <span className="eyebrow">THE DAILY FACE-OFF</span>
        <span className="live-tag">
          <span />
          {day.isRest ? 'REST' : 'LIVE'}
        </span>
      </div>
      <div className="arena">
        <div className="arena-floor" />
        <div className="fighter">
          <span className="fighter-level">LV {p.user.level}</span>
          <Sprite player level={p.user.level} />
          <strong>{g.playerName}</strong>
          <small>The challenger</small>
        </div>
        <div className="vs">
          VS<span>◆</span>
        </div>
        <div className="fighter">
          <span className="fighter-level">LV {p.rival.level}</span>
          <Sprite kind={g.rival.sprite} palette={g.rival.palette} level={p.rival.level} />
          <strong>{g.rival.name}</strong>
          <small>Your worthy opponent</small>
        </div>
      </div>
      <div className="race-bars">
        <Bar label="YOU" value={day.isRest ? 0 : earned} max={day.peakXP} />
        <Bar label={g.rival.name.toUpperCase()} value={rival} max={day.peakXP} rival />
      </div>
      <div className={'gap ' + status.state}>
        <Icon
          name={status.state === 'lead' ? 'arrow' : status.state === 'rest' ? 'shield' : 'clock'}
        />
        <span>{status.label}</span>
      </div>
      <div className="race-bottom">
        <span>
          Rival target <strong>{day.isRest ? 0 : target} XP</strong>
        </span>
        <span>
          {day.k === 0.5 ? 'Calibration · 50%' : `${Math.round(day.k * 100)}% of your plan`}
        </span>
      </div>
      <div className="dialogue">
        <span className="dialogue-glyph">“</span>
        <p>{taunt(day.archetype, day.isRest ? 'rest' : 'hello', day.key)}</p>
        <small>— {g.rival.name}</small>
      </div>
    </section>
  );
}
