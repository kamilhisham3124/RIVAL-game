export const ui = {
  brand: 'RIVAL',
  tagline: 'Small habits. A worthy opponent.',
  local: 'Local play · saved on this device',
  offline: 'Offline · your progress is saved on this device',
  grace: 'Grace period — your rival is frozen. Finish strong.',
  empty: 'Your rival is waiting. Plan your day.',
  rest: 'No XP for anyone. Your streak freezes. One rest day per rolling seven days.',
  ratchet: 'Deleting or lowering task XP never lowers today’s rival target.',
  rule: 'Your rival matches your ambition. Complete more than its target to win.',
  storage: 'Local play is browser-only. Export a backup before clearing site data.',
};
export const templates = [
  { title: 'Study for 50 minutes', xp: 25, category: 'study' as const, focusMinutes: 50 },
  { title: 'Move for an hour', xp: 35, category: 'fitness' as const, focusMinutes: 0 },
  { title: 'Drink 8 glasses of water', xp: 15, category: 'health' as const, focusMinutes: 0 },
];
export const archetypes = [
  {
    id: 'blue' as const,
    name: 'The Blue',
    description: 'Cocky. Competitive. Slightly insufferable.',
  },
  { id: 'sensei' as const, name: 'The Sensei', description: 'Calm guidance. High expectations.' },
  { id: 'machine' as const, name: 'The Machine', description: 'Cold statistics. Zero excuses.' },
];
export const difficulties = [
  { k: 0.6 as const, name: 'Chill', percent: '60%' },
  { k: 0.75 as const, name: 'Rival', percent: '75%' },
  { k: 0.9 as const, name: 'Nightmare', percent: '90%' },
];
