'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useGame } from '@/store/game';
import { ui } from '@/strings/ui';
import { Shell } from './shell';
import { Sheet } from './sheet';
import { Icon } from './icon';
import { advance } from '@/engine/game';
import { useToast } from './providers';
export function Settings() {
  const g = useGame((s) => s.game)!,
    update = useGame((s) => s.update),
    reset = useGame((s) => s.reset),
    notify = useToast();
  const [tz, setTz] = useState(g.timezone),
    [change, setChange] = useState(false),
    [deleting, setDeleting] = useState(false),
    [confirm, setConfirm] = useState(''),
    [error, setError] = useState('');
  const exportGame = () => {
    const blob = new Blob([JSON.stringify(g, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rival-backup.json';
    a.click();
    URL.revokeObjectURL(url);
    notify('Backup exported. Keep it somewhere safe.');
  };
  return (
    <Shell title="Settings" eyebrow="MAKE THIS CARTRIDGE YOURS.">
      <div className="settings-content">
        <section className="panel">
          <h2>YOUR PROGRESS</h2>
          <div className="setting-row">
            <div>
              <strong>Local play</strong>
              <p>{ui.storage} Supabase account sync is planned for the next integration step.</p>
            </div>
          </div>
          <div className="setting-row">
            <div>
              <strong>Export your cartridge</strong>
              <p>Download your tasks and match history as JSON.</p>
            </div>
            <button className="button" onClick={exportGame}>
              <Icon name="download" />
              Export backup
            </button>
          </div>
        </section>
        <section className="panel">
          <h2>APPEARANCE</h2>
          <fieldset>
            <legend>Theme</legend>
            <div className="segment">
              {(['system', 'light', 'dark'] as const).map((theme) => (
                <button
                  key={theme}
                  aria-pressed={g.theme === theme}
                  onClick={() => update((g) => ({ ...g, theme }))}
                >
                  {theme[0].toUpperCase() + theme.slice(1)}
                </button>
              ))}
            </div>
          </fieldset>
          <label className="switch-row">
            <span>
              Legibility mode<small>Use a plain body font; keep pixel headings</small>
            </span>
            <input
              role="switch"
              type="checkbox"
              checked={g.legibility}
              onChange={(e) => update((g) => ({ ...g, legibility: e.target.checked }))}
            />
          </label>
          <label className="switch-row">
            <span>
              Sound effects<small>Short original tones when you complete tasks</small>
            </span>
            <input
              role="switch"
              type="checkbox"
              checked={g.sound}
              onChange={(e) => update((g) => ({ ...g, sound: e.target.checked }))}
            />
          </label>
        </section>
        <section className="panel">
          <h2>YOUR DAY</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              try {
                new Intl.DateTimeFormat('en', { timeZone: tz }).format(new Date());
                setChange(true);
                setError('');
              } catch {
                setError('Enter a valid IANA timezone, such as Asia/Kolkata.');
              }
            }}
          >
            <label>
              Timezone
              <input
                required
                value={tz}
                onChange={(e) => setTz(e.target.value)}
                list="timezones"
                aria-invalid={!!error}
              />
              <datalist id="timezones">
                {[
                  'Asia/Kolkata',
                  'Europe/London',
                  'America/New_York',
                  'America/Los_Angeles',
                  'Asia/Tokyo',
                  'Australia/Sydney',
                  'UTC',
                ].map((t) => (
                  <option key={t} value={t} />
                ))}
              </datalist>
            </label>
            {error && <p role="alert">{error}</p>}
            <button className="button" disabled={tz === g.timezone}>
              Change timezone
            </button>
          </form>
          <div className="setting-row">
            <div>
              <strong>Notifications</strong>
              <p>
                In-app rival messages are active. Background web push requires the later Supabase
                integration and explicit permission.
              </p>
            </div>
          </div>
          <Link className="setting-row" href="/rival">
            <span>Customize your rival</span>
            <Icon name="arrow" />
          </Link>
        </section>
        <section className="panel">
          <h2>CREDITS</h2>
          <p>
            Original RIVAL pixel characters and interface icons. Press Start 2P by CodeMan38 and
            VT323 by Peter Hull, SIL Open Font License.
          </p>
          <p className="footnote">
            Asset details and licenses are recorded in CREDITS.md. No third-party game artwork.
          </p>
        </section>
        <section className="panel danger">
          <h2>DANGER ZONE</h2>
          <div className="setting-row">
            <div>
              <strong>Erase local progress</strong>
              <p>Removes the cartridge saved in this browser. Export a backup first.</p>
            </div>
            <button
              className="button destructive"
              onClick={() => {
                setConfirm('');
                setDeleting(true);
              }}
            >
              Erase progress
            </button>
          </div>
        </section>
      </div>
      {change && (
        <Sheet title="Change your day boundary?" onClose={() => setChange(false)}>
          <p>
            Future days settle in {tz}. Existing day snapshots and historical records keep their
            original timezone.
          </p>
          <button
            className="button primary"
            onClick={() => {
              update((g) => ({ ...advance(g, new Date()), timezone: tz }));
              setChange(false);
              notify('Timezone saved for future days.');
            }}
          >
            Confirm timezone
          </button>
        </Sheet>
      )}
      {deleting && (
        <Sheet title="Erase your cartridge?" onClose={() => setDeleting(false)}>
          <p>
            This permanently erases local tasks, focus timers, and match history from this browser.
          </p>
          <label>
            Type ERASE to confirm
            <input value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </label>
          <button
            className="button destructive"
            disabled={confirm !== 'ERASE'}
            onClick={() => {
              reset();
              setDeleting(false);
            }}
          >
            Permanently erase local progress
          </button>
        </Sheet>
      )}
    </Shell>
  );
}
