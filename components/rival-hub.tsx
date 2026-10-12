'use client';
import { useState } from 'react';
import { useGame } from '@/store/game';
import { localDayKey, shiftDay } from '@/engine/day';
import { progression } from '@/engine/progression';
import { taunt } from '@/engine/taunts';
import { archetypes, difficulties } from '@/strings/ui';
import { Shell } from './shell';
import { Sprite } from './sprite';
import { useToast } from './providers';
export function RivalHub() {
  const g = useGame((s) => s.game)!,
    update = useGame((s) => s.update),
    notify = useToast();
  const [name, setName] = useState(g.rival.name);
  const p = progression(g.records);
  const today = localDayKey(g.timezone, new Date());
  const rules = g.rival.pending ?? g.rival;
  return (
    <Shell title="Your rival" eyebrow="THE OTHER HALF OF YOUR STORY.">
      <div className="two-columns">
        <section className="panel rival-preview">
          <span className="eyebrow">YOUR WORTHY OPPONENT</span>
          <Sprite large kind={g.rival.sprite} palette={g.rival.palette} level={p.rival.level} />
          <h2>{g.rival.name.toUpperCase()}</h2>
          <p>
            Level {p.rival.level} · {archetypes.find((a) => a.id === g.rival.archetype)?.name}
          </p>
          <div className="stats-grid">
            <div className="stat">
              <strong>{p.wins}</strong>
              <small>Your wins</small>
            </div>
            <div className="stat">
              <strong>{p.losses}</strong>
              <small>Their wins</small>
            </div>
            <div className="stat">
              <strong>{p.draws}</strong>
              <small>Draws</small>
            </div>
          </div>
          <p className="footnote">
            {p.rival.xp} / {p.rival.next} XP to level {p.rival.level + 1}. Evolution every five
            levels.
          </p>
          <div className="dialogue">
            <span className="dialogue-glyph">“</span>
            <p>{taunt(rules.archetype, 'hello', today)}</p>
          </div>
        </section>
        <div>
          <section className="panel">
            <h2>IDENTITY</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (name.trim()) {
                  update((g) => ({ ...g, rival: { ...g.rival, name: name.trim() } }));
                  notify('Rival name saved.');
                }
              }}
            >
              <label>
                Name
                <input
                  value={name}
                  maxLength={24}
                  required
                  onChange={(e) => setName(e.target.value)}
                />
              </label>
              <button className="button">Save name</button>
            </form>
            <fieldset>
              <legend>Character</legend>
              <div className="sprite-picker">
                {(['blaze', 'byte', 'moss'] as const).map((s) => (
                  <button
                    key={s}
                    aria-label={`Choose ${s} sprite`}
                    aria-pressed={g.rival.sprite === s}
                    onClick={() => update((g) => ({ ...g, rival: { ...g.rival, sprite: s } }))}
                  >
                    <Sprite kind={s} palette={g.rival.palette} />
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend>Palette</legend>
              <div className="segment">
                {(['ember', 'violet', 'mint'] as const).map((c) => (
                  <button
                    key={c}
                    aria-pressed={g.rival.palette === c}
                    onClick={() => update((g) => ({ ...g, rival: { ...g.rival, palette: c } }))}
                  >
                    {c[0].toUpperCase() + c.slice(1)}
                  </button>
                ))}
              </div>
            </fieldset>
            <p className="footnote">Cosmetic changes apply immediately.</p>
          </section>
          <section className="panel">
            <h2>PERSONALITY</h2>
            {archetypes.map((a) => (
              <button
                className="choice"
                key={a.id}
                aria-pressed={rules.archetype === a.id}
                onClick={() => {
                  update((g) => ({
                    ...g,
                    rival: {
                      ...g.rival,
                      pending: { day: shiftDay(today, 1), k: rules.k, archetype: a.id },
                    },
                  }));
                  notify('Personality queued for tomorrow.');
                }}
              >
                <strong>{a.name}</strong>
                <small>“{taunt(a.id, 'hello', today)}”</small>
              </button>
            ))}
          </section>
          <section className="panel">
            <h2>DIFFICULTY</h2>
            {difficulties.map((d) => (
              <button
                className="choice"
                key={d.k}
                aria-pressed={rules.k === d.k}
                onClick={() => {
                  update((g) => ({
                    ...g,
                    rival: {
                      ...g.rival,
                      pending: { day: shiftDay(today, 1), k: d.k, archetype: rules.archetype },
                    },
                  }));
                  notify('Difficulty queued for tomorrow.');
                }}
              >
                <strong>{d.name}</strong>
                <span>{d.percent}</span>
                <small>Win by completing more than {d.percent} of planned XP.</small>
              </button>
            ))}
            <p className="footnote">
              Difficulty and personality changes apply tomorrow. Rival levels are cosmetic; they
              never change the target.
            </p>
          </section>
        </div>
      </div>
    </Shell>
  );
}
