'use client';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePathname, useRouter } from 'next/navigation';
import { useGame } from '@/store/game';
import { advance } from '@/engine/game';
import { ui } from '@/strings/ui';
const ToastContext = createContext<(text: string) => void>(() => {});
export const useToast = () => useContext(ToastContext);
export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => new QueryClient());
  const [toast, setToast] = useState('');
  const [online, setOnline] = useState(true);
  const notify = useCallback((s: string) => setToast(s), []);
  const { game, hydrated, init, update, error } = useGame();
  const router = useRouter(),
    path = usePathname();
  useEffect(() => {
    if (hydrated) init();
  }, [hydrated, init]);
  useEffect(() => {
    if (!game) return;
    document.documentElement.dataset.theme = game.theme;
    document.documentElement.dataset.legibility = String(game.legibility);
    if (!game.onboarding && path !== '/onboarding') router.replace('/onboarding');
    else if (game.onboarding && path === '/onboarding') router.replace('/');
    else if (game.onboarding && path !== '/showdown' && game.records.some((r) => !r.seen))
      router.replace('/showdown');
  }, [game, path, router]);
  useEffect(() => {
    const tick = () => update((g) => advance(g, new Date()));
    const net = () => setOnline(navigator.onLine);
    net();
    window.addEventListener('online', net);
    window.addEventListener('offline', net);
    window.addEventListener('focus', tick);
    const interval = setInterval(tick, 60000);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', tick);
      window.removeEventListener('online', net);
      window.removeEventListener('offline', net);
    };
  }, [update]);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(''), 4000);
    return () => clearTimeout(id);
  }, [toast]);
  if (error)
    return (
      <main className="loading">
        <h1>Storage unavailable</h1>
        <p>{error}</p>
        <button onClick={() => location.reload()}>Reload</button>
      </main>
    );
  return (
    <QueryClientProvider client={client}>
      <ToastContext.Provider value={notify}>
        {!online && (
          <div className="offline" role="status">
            {ui.offline}
          </div>
        )}
        {!hydrated || !game ? (
          <main className="loading">
            <div className="logo">
              R<span>◆</span>VAL
            </div>
            <p>Loading your cartridge…</p>
          </main>
        ) : (
          children
        )}
        {toast && (
          <div role="status" className="toast">
            <span>◆</span>
            {toast}
            <button aria-label="Dismiss notification" onClick={() => setToast('')}>
              ×
            </button>
          </div>
        )}
      </ToastContext.Provider>
    </QueryClientProvider>
  );
}
