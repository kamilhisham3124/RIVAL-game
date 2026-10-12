'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useGame } from '@/store/game';
import {
  canRest,
  currentDay,
  editTasks,
  restDay,
  timerReady,
  timerRemaining,
  toggleTask,
  toggleTimer,
  abandonTimer,
} from '@/engine/game';
import { earnedXP, localDayKey, plannedXP, shiftDay } from '@/engine/day';
import { rivalTarget, rivalXPAt } from '@/engine/rival';
import { taunt } from '@/engine/taunts';
import { templates, ui } from '@/strings/ui';
import type { Task } from '@/engine/types';
import { playSound } from './sound';
import { Shell } from './shell';
import { Race } from './race';
import { CategoryIcon, Icon } from './icon';
import { TaskForm } from './task-form';
import { Sheet } from './sheet';
import { useToast } from './providers';
export function Today() {
  const g = useGame((s) => s.game)!,
    update = useGame((s) => s.update);
  const notify = useToast();
  const [now, setNow] = useState(new Date());
  const [editor, setEditor] = useState<Task | true | null>(null);
  const [remove, setRemove] = useState<Task | null>(null);
  const [rest, setRest] = useState(false);
  const [focus, setFocus] = useState<Task | null>(null);
  const overtaken = useRef('');
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    const shortcut = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        const state = useGame.getState().game;
        if (state) {
          const n = new Date(),
            key = currentDay(state, n);
          if (key === localDayKey(state.timezone, n) && !state.days[key]?.isRest) setEditor(true);
        }
      }
    };
    window.addEventListener('keydown', shortcut);
    return () => {
      clearInterval(t);
      window.removeEventListener('keydown', shortcut);
    };
  }, []);
  const key = currentDay(g, now),
    day = g.days[key];
  const grace = key !== localDayKey(g.timezone, now);
  const earned = day ? earnedXP(day.logs) : 0;
  const rival = day ? rivalXPAt(rivalTarget(day.peakXP, day.k), now, day, g.playerId) : 0;
  useEffect(() => {
    if (day && rival > earned && overtaken.current !== key) {
      overtaken.current = key;
      notify(taunt(day.archetype, 'overtake', key));
    }
  }, [day, rival, earned, key, notify]);
  if (!day) return null;
  const completed = day.logs.length;
  const remaining = timerRemaining(day, focus?.id ?? '', now.getTime());
  const complete = (task: Task) => {
    const done = day.logs.some((l) => l.taskId === task.id);
    if (!done && task.focusMinutes && !timerReady(day, task.id, now.getTime())) {
      setFocus(task);
      return;
    }
    update((g) => toggleTask(g, task.id, new Date()));
    notify(
      done ? 'Completion undone.' : `+${task.xp} XP · ${taunt(day.archetype, 'complete', task.id)}`,
    );
    if (!done) playSound('check', g.sound);
    if (!done && navigator.vibrate) navigator.vibrate(12);
  };
  return (
    <Shell
      title="Today"
      eyebrow="A FRESH DAY. A FAMILIAR RIVAL."
      action={
        <button
          className="button primary"
          disabled={grace || day.isRest}
          onClick={() => setEditor(true)}
        >
          <Icon name="plus" />
          Add task
        </button>
      }
    >
      {grace && <p className="banner">{ui.grace} Edits resume after 4 AM.</p>}
      <div className="dashboard">
        <div className="race-column">
          <Race now={now} />
          <section className="week-card">
            <div className="section-title">
              <h2>THE LAST 7 DAYS</h2>
              <Link href="/history" aria-label="View full history">
                <Icon name="arrow" />
              </Link>
            </div>
            <div className="week-strip">
              {Array.from({ length: 7 }, (_, i) => {
                const d = shiftDay(localDayKey(g.timezone, now), i - 6),
                  record = g.records.find((r) => r.day === d);
                return (
                  <div key={d} className={record?.result ?? 'blank'}>
                    <span>
                      {new Date(d + 'T12:00Z').toLocaleDateString('en', {
                        weekday: 'narrow',
                        timeZone: 'UTC',
                      })}
                    </span>
                    <strong aria-label={`${d}: ${record?.result ?? 'unsettled'}`}>
                      {record?.result === 'win'
                        ? '▲'
                        : record?.result === 'loss'
                          ? '▼'
                          : record?.result === 'draw'
                            ? '●'
                            : record?.result === 'rest'
                              ? '◇'
                              : '·'}
                    </strong>
                  </div>
                );
              })}
            </div>
            <p>Every day is a new match.</p>
          </section>
        </div>
        <section className="task-panel">
          <div className="section-title">
            <div>
              <h2>YOUR COMMITMENTS</h2>
              <p>
                {completed} of {day.tasks.length} completed · {earned} XP earned
              </p>
            </div>
            <span className="count-chip">
              {completed}/{day.tasks.length}
            </span>
          </div>
          <div className="task-list">
            {day.tasks.map((task) => {
              const done = day.logs.some((l) => l.taskId === task.id);
              return (
                <div className={'task-row ' + (done ? 'completed' : '')} key={task.id}>
                  <CategoryIcon category={task.category} />
                  <div className="task-copy">
                    <strong>{task.title}</strong>
                    <small>
                      {task.schedule === 'once'
                        ? 'One time'
                        : task.schedule === 'daily'
                          ? 'Daily'
                          : task.schedule === 'weekdays'
                            ? 'Weekdays'
                            : 'Custom schedule'}
                      {task.focusMinutes > 0 && (
                        <>
                          <span> · </span>
                          <Icon name="clock" />
                          {task.focusMinutes} min focus
                        </>
                      )}
                    </small>
                  </div>
                  <span className="xp-chip">+{task.xp}</span>
                  <button
                    className="check-button"
                    aria-label={`${done ? 'Undo' : 'Complete'} ${task.title}`}
                    aria-pressed={done}
                    disabled={day.isRest}
                    onClick={() => complete(task)}
                  >
                    {done ? (
                      <Icon name="check" />
                    ) : task.focusMinutes && !timerReady(day, task.id, now.getTime()) ? (
                      <Icon name="clock" />
                    ) : (
                      <span />
                    )}
                  </button>
                  <div className="row-actions">
                    <button
                      className="icon-button"
                      aria-label={`Edit ${task.title}`}
                      disabled={grace || day.isRest}
                      onClick={() => setEditor(task)}
                    >
                      <Icon name="edit" />
                    </button>
                    <button
                      className="icon-button"
                      aria-label={`Delete ${task.title}`}
                      disabled={grace || day.isRest}
                      onClick={() => setRemove(task)}
                    >
                      <Icon name="close" />
                    </button>
                  </div>
                </div>
              );
            })}
            {!day.tasks.length && (
              <div className="empty-state">
                <Icon name="study" />
                <h3>Give today a purpose.</h3>
                <p>{ui.empty}</p>
                <div className="template-list">
                  {templates.map((t) => (
                    <button
                      key={t.title}
                      onClick={() => {
                        const task: Task = {
                          ...t,
                          id: crypto.randomUUID(),
                          active: true,
                          createdDay: localDayKey(g.timezone, now),
                          days: [],
                          schedule: 'daily',
                          onceDay: localDayKey(g.timezone, now),
                        };
                        update((g) => editTasks(g, [...g.tasks, task], now));
                      }}
                    >
                      + {t.title} <span>{t.xp} XP</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {day.tasks.length > 0 && (
              <button
                className="add-row"
                disabled={grace || day.isRest}
                onClick={() => setEditor(true)}
              >
                <Icon name="plus" /> Add another commitment <span>↗</span>
              </button>
            )}
          </div>
          <div className="plan-summary">
            <span>Planned today</span>
            <strong>{plannedXP(day.tasks)} XP</strong>
          </div>
          <div className="how-to">
            <span className="eyebrow">THE RIVAL RULE</span>
            <p>{ui.rule}</p>
            <small>Today’s target stays at its highest point. No shortcuts.</small>
          </div>
          {canRest(g, key) && !grace && (
            <button className="rest-button" onClick={() => setRest(true)}>
              <Icon name="shield" />
              <span>
                Need a breather?<small>Take your weekly rest day</small>
              </span>
              <Icon name="arrow" />
            </button>
          )}
          {day.isRest && (
            <div className="banner">
              <Icon name="shield" />
              You’re resting today. Your streak is safe.
            </div>
          )}
          <div className="daily-note">
            <span>✦</span>
            <p>
              You don’t need a perfect day.
              <br />
              You just need to show up.
            </p>
          </div>
        </section>
      </div>
      {editor && (
        <TaskForm task={editor === true ? undefined : editor} onClose={() => setEditor(null)} />
      )}{' '}
      {remove && (
        <Sheet title="Delete this task?" onClose={() => setRemove(null)}>
          <p>{remove.title}</p>
          <p>{ui.ratchet}</p>
          <button
            className="button destructive"
            onClick={() => {
              update((g) =>
                editTasks(
                  g,
                  g.tasks.map((t) => (t.id === remove.id ? { ...t, active: false } : t)),
                  new Date(),
                ),
              );
              notify('Task removed. Today’s rival target stays locked.');
              setRemove(null);
            }}
          >
            Delete task
          </button>
        </Sheet>
      )}
      {rest && (
        <Sheet title="Rest is part of the game" onClose={() => setRest(false)}>
          <p>{ui.rest}</p>
          <button
            className="button primary"
            onClick={() => {
              update((g) => restDay(g, new Date()));
              setRest(false);
              notify('Recovery protocol active.');
            }}
          >
            Take a rest day
          </button>
        </Sheet>
      )}
      {focus && (
        <Sheet title="Focus mode" onClose={() => setFocus(null)}>
          <p className="eyebrow">ONE TASK. YOUR FULL ATTENTION.</p>
          <h3>{focus.title}</h3>
          <div className="timer" role="timer" aria-label="Focus time remaining">
            {String(Math.floor(remaining / 60)).padStart(2, '0')}:
            {String(remaining % 60).padStart(2, '0')}
          </div>
          <p>
            {remaining === 0
              ? 'You showed up. Claim your XP.'
              : 'Your timer keeps running when you leave this tab.'}
          </p>
          {remaining === 0 ? (
            <button
              className="button primary"
              onClick={() => {
                complete(focus);
                setFocus(null);
              }}
            >
              Claim +{focus.xp} XP
            </button>
          ) : (
            <button
              className="button primary"
              onClick={() => update((g) => toggleTimer(g, focus.id, new Date()))}
            >
              {day.focus[focus.id]?.startedAt != null ? 'Pause timer' : 'Start / resume timer'}
            </button>
          )}
          <button
            className="button quiet"
            onClick={() => {
              update((g) => abandonTimer(g, focus.id, new Date()));
              setFocus(null);
            }}
          >
            Abandon timer
          </button>
        </Sheet>
      )}
    </Shell>
  );
}
