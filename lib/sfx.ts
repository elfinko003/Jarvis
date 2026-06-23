// Lightweight WebAudio beeps — same raw-oscillator approach as
// BootSequence's playBootTone, no Tone.js/audio-file dependency needed for
// sounds this simple.
let sharedCtx: AudioContext | null = null;

function getContext(): AudioContext | null {
  try {
    if (!sharedCtx) {
      const AudioCtx =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      sharedCtx = new AudioCtx();
    }
    return sharedCtx;
  } catch {
    return null;
  }
}

function playTone(freq: number, durationMs: number, volume: number, type: OscillatorType = "sine") {
  const ctx = getContext();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + durationMs / 1000);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + durationMs / 1000 + 0.02);
  } catch {
    // autoplay blocked or AudioContext unavailable — sfx skipped silently
  }
}

// Short, quiet click on every view change (manual or auto-rotated).
export function playClickBeep(): void {
  playTone(880, 70, 0.06, "square");
}

// Slightly brighter two-tone chirp when the wake word is recognized.
export function playWakeBeep(): void {
  playTone(660, 90, 0.09, "sine");
  setTimeout(() => playTone(990, 100, 0.09, "sine"), 90);
}
