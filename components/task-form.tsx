'use client';
import { useState } from 'react';
import { localDayKey } from '@/engine/day';
import type { Task, Category, Schedule } from '@/engine/types';
import { useGame } from '@/store/game';
import { editTasks } from '@/engine/game';
import { Sheet } from './sheet';
import { useToast } from './providers';
import { ui } from '@/strings/ui';
export function TaskForm({ task, onClose }: { task?: Task; onClose: () => void }) {
  const g = useGame((s) => s.game)!;
  const update = useGame((s) => s.update);
  const notify = useToast();
  const [title, setTitle] = useState(task?.title ?? '');
  const [xp, setXP] = useState(task?.xp ?? 25);
  const [category, setCategory] = useState<Category>(task?.category ?? 'study');
  const [schedule, setSchedule] = useState<Schedule>(task?.schedule ?? 'daily');
  const [days, setDays] = useState(task?.days ?? [1, 2, 3, 4, 5]);
  const [focus, setFocus] = useState(!!task?.focusMinutes);
  const [minutes, setMinutes] = useState(task?.focusMinutes || 50);
  const [once, setOnce] = useState(task?.onceDay ?? localDayKey(g.timezone, new Date()));
  return (
    <Sheet title={task ? 'Edit task' : 'A new commitment'} onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const today = localDayKey(g.timezone, new Date());
          const next: Task = {
            id: task?.id ?? crypto.randomUUID(),
            title: title.trim(),
            xp,
            category,
            schedule,
            days,
            onceDay: once,
            focusMinutes: focus ? minutes : 0,
            active: true,
            createdDay: task?.createdDay ?? today,
          };
          if (!next.title || xp < 10 || (schedule === 'custom' && !days.length)) return;
          update((g) =>
            editTasks(
              g,
              task ? g.tasks.map((t) => (t.id === task.id ? next : t)) : [...g.tasks, next],
              new Date(),
            ),
          );
          notify('Task saved. Your rival is watching.');
          onClose();
        }}
      >
        <label>
          Task title
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={100}
            autoFocus
            placeholder="What will you show up for?"
          />
        </label>
        <div className="form-grid">
          <label>
            XP reward
            <input
              type="number"
              min="10"
              max="5000"
              step="5"
              value={xp}
              required
              onChange={(e) => setXP(Number(e.target.value))}
            />
          </label>
          <label>
            Category
            <select value={category} onChange={(e) => setCategory(e.target.value as Category)}>
              <option value="study">Study</option>
              <option value="fitness">Fitness</option>
              <option value="health">Health</option>
              <option value="life">Life</option>
            </select>
          </label>
        </div>
        <label>
          Repeats
          <select value={schedule} onChange={(e) => setSchedule(e.target.value as Schedule)}>
            <option value="daily">Every day</option>
            <option value="weekdays">Weekdays</option>
            <option value="custom">Specific days</option>
            <option value="once">One time</option>
          </select>
        </label>
        {schedule === 'custom' && (
          <fieldset>
            <legend>Days of the week</legend>
            <div className="day-picks">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
                <button
                  type="button"
                  key={d}
                  aria-pressed={days.includes(i)}
                  onClick={() =>
                    setDays(days.includes(i) ? days.filter((v) => v !== i) : [...days, i])
                  }
                >
                  {d}
                </button>
              ))}
            </div>
            {!days.length && <p role="alert">Choose at least one day.</p>}
          </fieldset>
        )}
        {schedule === 'once' && (
          <label>
            Date
            <input
              type="date"
              value={once}
              min={localDayKey(g.timezone, new Date())}
              required
              onChange={(e) => setOnce(e.target.value)}
            />
          </label>
        )}
        <label className="switch-row">
          <span>
            Focus timer<small>Finish a countdown to unlock check-off</small>
          </span>
          <input type="checkbox" checked={focus} onChange={(e) => setFocus(e.target.checked)} />
        </label>
        {focus && (
          <label>
            Focus minutes
            <input
              type="number"
              min="1"
              max="480"
              required
              value={minutes}
              onChange={(e) => setMinutes(Number(e.target.value))}
            />
          </label>
        )}
        <p className="footnote">{ui.ratchet}</p>
        <button className="button primary" type="submit">
          {task ? 'Save changes' : 'Add task'} <span>↗</span>
        </button>
      </form>
    </Sheet>
  );
}
