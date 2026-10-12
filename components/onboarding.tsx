'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '@/store/game';
import { finishOnboarding } from '@/engine/game';
import { localDayKey } from '@/engine/day';
import { archetypes, difficulties, templates } from '@/strings/ui';
import type { Archetype, Rival, Task } from '@/engine/types';
import { Sprite } from './sprite';
import { Icon } from './icon';
export function Onboarding() {
  const g = useGame((s) => s.game)!,
    update = useGame((s) => s.update),
    router = useRouter();
  const [step, setStep] = useState(0),
    [name, setName] = useState('Blaze'),
    [player, setPlayer] = useState('You'),
    [archetype, setArchetype] = useState<Archetype>('blue'),
    [sprite, setSprite] = useState<Rival['sprite']>('blaze'),
    [k, setK] = useState<Rival['k']>(0.75),
    [selected, setSelected] = useState([0, 1, 2]),
    [custom, setCustom] = useState('');
  const finish = () => {
    const day = localDayKey(g.timezone, new Date());
    const tasks: Task[] = selected.map((i) => ({
      ...templates[i],
      id: crypto.randomUUID(),
      active: true,
      createdDay: day,
      days: [],
      schedule: 'daily',
      onceDay: day,
    }));
    if (custom.trim())
      tasks.push({
        id: crypto.randomUUID(),
        title: custom.trim(),
        xp: 25,
        category: 'life',
        focusMinutes: 0,
        active: true,
        createdDay: day,
        days: [],
        schedule: 'daily',
        onceDay: day,
      });
    update((g) =>
      finishOnboarding(
        {
          ...g,
          playerName: player.trim() || 'You',
          rival: { ...g.rival, name: name.trim(), archetype, sprite, k },
        },
        tasks,
        new Date(),
      ),
    );
    router.replace('/');
  };
  return (
    <main className="onboarding">
      <div className="logo">
        R<span>◆</span>VAL
      </div>
      <div className="onboarding-card">
        <div className="step-indicator" aria-label={`Step ${step + 1} of 4`}>
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className={i <= step ? 'active' : ''} />
          ))}
        </div>
        <p className="eyebrow">
          {
            [
              'WELCOME TO YOUR NEXT CHAPTER',
              'MEET YOUR WORTHY OPPONENT',
              'SET THE STAKES',
              'MAKE YOUR FIRST COMMITMENTS',
            ][step]
          }
        </p>
        {step === 0 && (
          <>
            <div className="onboarding-sprites">
              <Sprite player />
              <span className="vs">VS</span>
              <Sprite />
            </div>
            <h1>
              Meet the you
              <br />
              who shows up.
            </h1>
            <p>A daily habit race against a rival who never skips.</p>
            <ul className="pitch">
              <li>
                <span>01</span> Plan a few meaningful tasks.
              </li>
              <li>
                <span>02</span> Complete them. Collect XP.
              </li>
              <li>
                <span>03</span> Beat your rival at the daily showdown.
              </li>
            </ul>
            <p className="footnote">No account required. Local play saves in this browser.</p>
          </>
        )}
        {step === 1 && (
          <>
            <h1>
              Your rival.
              <br />
              Your rules.
            </h1>
            <div className="sprite-picker">
              {(['blaze', 'byte', 'moss'] as const).map((s) => (
                <button
                  key={s}
                  aria-label={`Choose ${s} sprite`}
                  aria-pressed={sprite === s}
                  onClick={() => setSprite(s)}
                >
                  <Sprite kind={s} />
                </button>
              ))}
            </div>
            <label>
              Rival name
              <input maxLength={24} value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <label>
              Your name
              <input maxLength={24} value={player} onChange={(e) => setPlayer(e.target.value)} />
            </label>
            <fieldset>
              <legend>Personality</legend>
              {archetypes.map((a) => (
                <button
                  className="choice"
                  key={a.id}
                  aria-pressed={archetype === a.id}
                  onClick={() => setArchetype(a.id)}
                >
                  <strong>{a.name}</strong>
                  <small>{a.description}</small>
                </button>
              ))}
            </fieldset>
          </>
        )}
        {step === 2 && (
          <>
            <h1>
              A little pressure.
              <br />A lot of potential.
            </h1>
            <p>Your rival’s target scales with the XP you plan.</p>
            <div className="difficulty-picks">
              {difficulties.map((d) => (
                <button
                  className="choice"
                  key={d.k}
                  aria-pressed={k === d.k}
                  onClick={() => setK(d.k)}
                >
                  <strong>{d.name}</strong>
                  <span>{d.percent}</span>
                  <small>Complete more than {d.percent} to win</small>
                </button>
              ))}
            </div>
            <div className="banner">
              <Icon name="star" />
              <div>
                <strong>Your first day is calibration.</strong>
                <p>Today, the target is only 50%. Find your feet.</p>
              </div>
            </div>
          </>
        )}
        {step === 3 && (
          <>
            <h1>
              Small steps.
              <br />
              Real progress.
            </h1>
            <p>Start with three meaningful habits. You can edit them later.</p>
            <div className="template-list">
              {templates.map((t, i) => (
                <button
                  key={t.title}
                  aria-pressed={selected.includes(i)}
                  onClick={() =>
                    setSelected(
                      selected.includes(i) ? selected.filter((v) => v !== i) : [...selected, i],
                    )
                  }
                >
                  <span>
                    {selected.includes(i) ? '✓' : '+'} {t.title}
                  </span>
                  <strong>{t.xp} XP</strong>
                </button>
              ))}
            </div>
            <label>
              Your own daily task
              <input
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
                maxLength={100}
                placeholder="Optional: make it personal"
              />
            </label>
            <p className="footnote">
              Study uses a 50-minute focus timer. Choose at least one task.
            </p>
          </>
        )}
        <div className="onboarding-actions">
          {step > 0 && (
            <button className="button quiet" onClick={() => setStep(step - 1)}>
              Back
            </button>
          )}
          <button
            className="button primary"
            disabled={
              (step === 1 && !name.trim()) || (step === 3 && !selected.length && !custom.trim())
            }
            onClick={() => (step === 3 ? finish() : setStep(step + 1))}
          >
            {step === 3 ? 'Start my rivalry' : 'Continue'}
            <Icon name="arrow" />
          </button>
        </div>
      </div>
      <small>One day. One match. A better you.</small>
    </main>
  );
}
