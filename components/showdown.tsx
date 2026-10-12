'use client';
import { fromZonedTime } from 'date-fns-tz';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '@/store/game';
import { badges, progression } from '@/engine/progression';
import { taunt } from '@/engine/taunts';
import { rivalEvents } from '@/engine/rival';
import { Sprite } from './sprite';
import { Bar } from './race';
import { Icon } from './icon';
export function Showdown() {
  const g = useGame((s) => s.game)!,
    update = useGame((s) => s.update),
    router = useRouter();
  const record = [...g.records]
    .filter((r) => !r.seen)
    .sort((a, b) => a.day.localeCompare(b.day))
    .at(-1);
  useEffect(() => {
    if (!record) router.replace('/');
  }, [record, router]);
  if (!record) return null;
  const p = progression(g.records);
  const previous = badges(g.records.filter((r) => r.day < record.day));
  const unlocked = badges(g.records).filter(
    (b) => b.unlocked && !previous.find((p) => p.id === b.id)?.unlocked,
  );
  const event = record.result === 'rest' ? 'rest' : record.result;
  const recap = [
    ...record.logs.map((l) => ({
      at: new Date(l.completedAt).toLocaleTimeString('en', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: record.timezone,
      }),
      time: new Date(l.completedAt).getTime(),
      line: `You completed “${l.title}” +${l.xp} XP`,
    })),
    ...(record.result === 'rest'
      ? []
      : rivalEvents(record.target, record.day, record.playerId)
          .filter((e) => e.xp > 0)
          .map((e) => ({
            at: `${String(e.hour % 24).padStart(2, '0')}:00`,
            time: fromZonedTime(
              e.hour === 24
                ? record.day + 'T23:59:59'
                : record.day + `T${String(e.hour).padStart(2, '0')}:00:00`,
              record.timezone,
            ).getTime(),
            line: `${g.rival.name} trained +${e.xp} XP`,
          }))),
  ];
  return (
    <main className="showdown">
      <div className="showdown-inner">
        <div className="logo">
          R<span>◆</span>VAL
        </div>
        <p className="eyebrow">DAILY SHOWDOWN / {record.day}</p>
        <div className="fighters">
          <div>
            <Sprite player large level={p.user.level} />
            <strong>{g.playerName}</strong>
          </div>
          <span className="vs">VS</span>
          <div>
            <Sprite large kind={g.rival.sprite} palette={g.rival.palette} level={p.rival.level} />
            <strong>{g.rival.name}</strong>
          </div>
        </div>
        <div className="race-bars">
          <Bar label="YOU" value={record.userXP} max={record.plannedXP} />
          <Bar
            label={g.rival.name.toUpperCase()}
            value={record.rivalXP}
            max={record.plannedXP}
            rival
          />
        </div>
        <h1 className={record.result} aria-live="polite">
          {record.result === 'win'
            ? 'VICTORY'
            : record.result === 'loss'
              ? 'DEFEAT'
              : record.result === 'draw'
                ? 'DRAW'
                : 'REST DAY'}
        </h1>
        {record.forfeit && <p>No tasks completed. Tomorrow is a fresh start.</p>}
        <div className="dialogue">
          <span className="dialogue-glyph">“</span>
          <p>{taunt(record.archetype, event, record.day)}</p>
          <small>— {g.rival.name}</small>
        </div>
        <div className="stats-grid">
          <div className="stat">
            <strong>+{record.userXP}</strong>
            <small>XP earned</small>
          </div>
          <div className="stat">
            <strong>{p.user.level}</strong>
            <small>Your level</small>
          </div>
          <div className="stat">
            <strong>{p.streak}</strong>
            <small>Win streak</small>
          </div>
        </div>
        <p>
          {p.user.xp} / {p.user.next} XP to your next level.
        </p>
        {unlocked.length > 0 && (
          <div className="badge-grid">
            {unlocked.map((b) => (
              <div className="badge unlocked" key={b.id}>
                <Icon name="star" />
                <div>
                  <strong>{b.name} unlocked</strong>
                  <small>{b.detail}</small>
                </div>
              </div>
            ))}
          </div>
        )}
        <section className="recap" tabIndex={0} aria-label="Match recap">
          <h2>THE MATCH RECAP</h2>
          {recap
            .sort((a, b) => a.time - b.time)
            .map((l, i) => (
              <p key={i}>
                <small>{l.at}</small> — {l.line}
              </p>
            ))}
          {record.result === 'rest' && <p>Both rivals recharged. Your streak stayed safe.</p>}
        </section>
        <button
          className="button primary"
          onClick={() => {
            update((g) => ({ ...g, records: g.records.map((r) => ({ ...r, seen: true })) }));
            router.replace('/');
          }}
        >
          Start today
          <Icon name="arrow" />
        </button>
      </div>
    </main>
  );
}
