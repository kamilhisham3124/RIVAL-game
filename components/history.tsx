'use client';
import { useState } from 'react';
import { useGame } from '@/store/game';
import { badges, progression } from '@/engine/progression';
import { localDayKey } from '@/engine/day';
import type { DayRecord } from '@/engine/types';
import { Shell } from './shell';
import { Icon } from './icon';
import { Sheet } from './sheet';
import { Bar } from './race';
export function History() {
  const g = useGame((s) => s.game)!;
  const today = localDayKey(g.timezone, new Date());
  const [month, setMonth] = useState(today.slice(0, 7));
  const [detail, setDetail] = useState<DayRecord | null>(null);
  const p = progression(g.records);
  const year = Number(month.slice(0, 4)),
    m = Number(month.slice(5));
  const count = new Date(Date.UTC(year, m, 0)).getUTCDate(),
    offset = new Date(month + '-01T12:00Z').getUTCDay();
  const move = (n: number) =>
    setMonth(new Date(Date.UTC(year, m - 1 + n, 1)).toISOString().slice(0, 7));
  return (
    <Shell title="History" eyebrow="PROGRESS HAS A PATTERN.">
      <div className="stats-grid">
        <div className="stat">
          <strong>{p.wins}</strong>
          <small>Total wins</small>
        </div>
        <div className="stat">
          <strong>{p.best}</strong>
          <small>Best streak</small>
        </div>
        <div className="stat">
          <strong>{p.completion}%</strong>
          <small>XP completion</small>
        </div>
      </div>
      <div className="panel">
        <div className="calendar-head">
          <button className="icon-button" aria-label="Previous month" onClick={() => move(-1)}>
            ←
          </button>
          <h2>
            {new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric', timeZone: 'UTC' })
              .format(new Date(month + '-01T12:00Z'))
              .toUpperCase()}
          </h2>
          <button className="icon-button" aria-label="Next month" onClick={() => move(1)}>
            →
          </button>
        </div>
        <div className="calendar" role="group" aria-label="Match history calendar">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <span className="calendar-label" key={d}>
              {d}
            </span>
          ))}
          {Array.from({ length: offset }, (_, i) => (
            <span key={'blank' + i} />
          ))}
          {Array.from({ length: count }, (_, i) => {
            const key = month + '-' + String(i + 1).padStart(2, '0'),
              r = g.records.find((r) => r.day === key);
            return (
              <button
                className={`calendar-cell ${r?.result ?? 'blank'} ${key === today ? 'today' : ''}`}
                key={key}
                disabled={!r}
                aria-label={`${key}: ${r?.result ?? 'No settled match'}`}
                onClick={() => r && setDetail(r)}
              >
                <span>{i + 1}</span>
                <strong>
                  {r?.result === 'win'
                    ? '▲'
                    : r?.result === 'loss'
                      ? '▼'
                      : r?.result === 'draw'
                        ? '●'
                        : r?.result === 'rest'
                          ? '◇'
                          : ''}
                </strong>
              </button>
            );
          })}
        </div>
        <div className="legend">
          <span>▲ Win</span>
          <span>▼ Loss</span>
          <span>● Draw</span>
          <span>◇ Rest</span>
        </div>
        {!g.records.length && (
          <p className="footnote" style={{ marginTop: 24 }}>
            Your story starts today. Settled matches appear here after the 4 AM grace window.
          </p>
        )}
      </div>
      <section className="panel">
        <h2>YOUR TROPHY SHELF</h2>
        <div className="badge-grid">
          {badges(g.records).map((b) => (
            <div className={'badge ' + (b.unlocked ? 'unlocked' : '')} key={b.id}>
              <Icon name="star" />
              <div>
                <strong>
                  {b.name} · {b.unlocked ? 'Unlocked' : 'Locked'}
                </strong>
                <small>{b.detail}</small>
              </div>
            </div>
          ))}
        </div>
      </section>
      {detail && (
        <Sheet title={`${detail.day} · ${detail.result}`} onClose={() => setDetail(null)}>
          <Bar label="YOU" value={detail.userXP} max={detail.plannedXP} />
          <div style={{ marginTop: 20 }}>
            <Bar
              label={g.rival.name.toUpperCase()}
              value={detail.rivalXP}
              max={detail.plannedXP}
              rival
            />
          </div>
          <p style={{ marginTop: 24 }}>
            Rival target: {detail.target} XP{detail.forfeit ? ' · Forfeit' : ''}
          </p>
          {detail.logs.map((l) => (
            <p key={l.taskId}>
              {l.title} <span className="result-win">+{l.xp} XP</span>
            </p>
          ))}
          {!detail.logs.length && (
            <p className="footnote">
              {detail.result === 'rest' ? 'Recovery day. Streak preserved.' : 'No tasks completed.'}
            </p>
          )}
        </Sheet>
      )}
    </Shell>
  );
}
