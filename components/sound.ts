'use client';
/** Original synthesized tones. Never starts audio without a user gesture. */
export function playSound(kind: 'check' | 'ready' | 'win', enabled: boolean) {
  if (!enabled) return;
  try {
    const context = new AudioContext();
    const notes =
      kind === 'win' ? [523, 659, 784, 1047] : kind === 'ready' ? [659, 784, 659] : [523, 784];
    notes.forEach((frequency, i) => {
      const oscillator = context.createOscillator(),
        gain = context.createGain();
      oscillator.type = 'square';
      oscillator.frequency.value = frequency;
      gain.gain.value = 0.025;
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(context.currentTime + i * 0.09);
      oscillator.stop(context.currentTime + i * 0.09 + 0.07);
    });
    setTimeout(() => void context.close(), 1000);
  } catch {
    /* Sound is a progressive enhancement. */
  }
}
