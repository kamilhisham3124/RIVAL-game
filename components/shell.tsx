'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from './icon';
import { useGame } from '@/store/game';
import { progression } from '@/engine/progression';
import { ui } from '@/strings/ui';
export function Shell({
  title,
  eyebrow,
  children,
  action,
}: {
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  const path = usePathname();
  const g = useGame((s) => s.game);
  if (!g) return null;
  const p = progression(g.records);
  return (
    <div className="app-shell">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <aside className="sidebar">
        <Link href="/" className="logo" aria-label="RIVAL home">
          R<span>◆</span>VAL<span className="brand-dot">®</span>
        </Link>
        <p className="brand-tag">Your habits. Your rivalry.</p>
        <div className="nav-caption">YOUR CARTRIDGE</div>
        <nav aria-label="Main navigation">
          {[
            ['/', 'today', 'Today'],
            ['/history', 'history', 'History'],
            ['/rival', 'rival', 'Rival'],
            ['/settings', 'settings', 'Settings'],
          ].map(([href, icon, label]) => (
            <Link
              key={href}
              href={href}
              aria-current={path === href ? 'page' : undefined}
              className={path === href ? 'active' : ''}
            >
              <Icon name={icon} />
              <span>{label}</span>
              {path === href && <span className="nav-dot">■</span>}
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="player-mini">
            <span className="avatar">Y</span>
            <div>
              <strong>{g.playerName}</strong>
              <small>Level {p.user.level} · Adventurer</small>
            </div>
          </div>
          <small>{ui.local}</small>
          <div className="save-light">
            <span />
            Cartridge saved
          </div>
        </div>
      </aside>
      <div className="main-wrap">
        <header className="topbar">
          <span>
            <span className="status-dot" /> DAILY MATCH /{' '}
            <strong>
              {new Intl.DateTimeFormat('en', {
                month: 'short',
                day: '2-digit',
                timeZone: g.timezone,
              })
                .format(new Date())
                .toUpperCase()}
            </strong>
          </span>
          <div>
            <span className="streak">
              <Icon name="flame" /> {p.streak} <small>day streak</small>
            </span>
            <span className="level-chip">LV {p.user.level}</span>
          </div>
        </header>
        <main id="main">
          <header className="page-heading">
            <div>
              <p className="eyebrow">{eyebrow ?? 'ONE DAY. ONE MATCH. YOUR MOVE.'}</p>
              <h1>{title}</h1>
            </div>
            {action}
          </header>
          {children}
        </main>
        <footer className="page-footer">
          <span>MAKE TODAY COUNT.</span>
          <span>RIVAL · LOCAL PLAY</span>
        </footer>
      </div>
    </div>
  );
}
