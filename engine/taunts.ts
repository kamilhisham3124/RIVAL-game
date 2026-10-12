import type { Archetype } from './types';
import { hash } from './rival';
export type Event = 'hello' | 'complete' | 'overtake' | 'win' | 'loss' | 'draw' | 'rest';
const bank: Record<Archetype, Record<Event, string[]>> = {
  blue: {
    hello: ['See you at midnight. Bring your best.', 'Your potential called. I answered.'],
    complete: ['Okay. That one counts.', 'Finally. I was getting bored.'],
    overtake: ['I’m ahead. Your move.', 'Less scrolling. More doing.'],
    win: ['…Fine. Today was yours.', 'Enjoy it. I’m training for tomorrow.'],
    loss: ['I showed up. That was the difference.', 'Tomorrow’s a clean slate. Use it.'],
    draw: ['A tie? I’ll allow it. Once.'],
    rest: ['Even legends recharge. See you tomorrow.'],
  },
  sensei: {
    hello: ['Small efforts, repeated. Begin.'],
    complete: ['A step forward is still a step.'],
    overtake: ['Your intention needs action.'],
    win: ['You honored your commitments today.'],
    loss: ['Learn from today. Return tomorrow.'],
    draw: ['Balance. Tomorrow, go further.'],
    rest: ['Recovery is part of the practice.'],
  },
  machine: {
    hello: ['Daily protocol initialized.'],
    complete: ['Task registered. Efficiency increasing.'],
    overtake: ['Performance gap detected. Action required.'],
    win: ['Outcome: human outperformed baseline.'],
    loss: ['Outcome: baseline exceeded human output.'],
    draw: ['Output parity confirmed.'],
    rest: ['Recovery protocol active.'],
  },
};
export function taunt(archetype: Archetype, event: Event, seed: string): string {
  const lines = bank[archetype][event];
  return lines[hash(seed) % lines.length];
}
