'use client';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { advance, newGame } from '@/engine/game';
import type { Game } from '@/engine/types';
interface State {
  game: Game | null;
  hydrated: boolean;
  error: string | null;
  init: () => void;
  update: (fn: (g: Game) => Game) => void;
  setHydrated: () => void;
  reset: () => void;
}
export const useGame = create<State>()(
  persist(
    (set, get) => ({
      game: null,
      hydrated: false,
      error: null,
      setHydrated: () => set({ hydrated: true }),
      init: () => {
        if (!get().hydrated) return;
        const g = get().game;
        set({
          game: g
            ? advance(g, new Date())
            : newGame(
                new Date(),
                Intl.DateTimeFormat().resolvedOptions().timeZone,
                crypto.randomUUID(),
              ),
        });
      },
      update: (fn) => {
        const g = get().game;
        if (g) set({ game: fn(g) });
      },
      reset: () =>
        set({
          game: newGame(
            new Date(),
            Intl.DateTimeFormat().resolvedOptions().timeZone,
            crypto.randomUUID(),
          ),
        }),
    }),
    {
      name: 'rival-v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ game: s.game }),
      onRehydrateStorage: () => (state, error) => {
        if (error)
          useGame.setState({
            error: 'Local storage could not be read. Enable browser storage and reload.',
            hydrated: true,
          });
        else state?.setHydrated();
      },
    },
  ),
);
