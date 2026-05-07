let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

export function playBeep(freq: number, duration: number, volume = 0.3): void {
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Audio not available — silently ignore
  }
}

export function playTimerEndAlarm(): void {
  playBeep(880, 0.2, 0.3);
  setTimeout(() => playBeep(880, 0.2, 0.3), 250);
  setTimeout(() => playBeep(880, 0.3, 0.4), 500);
}

export function playSetCompleteBeep(): void {
  playBeep(660, 0.12, 0.2);
}
