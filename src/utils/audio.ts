// Web Audio API alarm sound synthesizer for academic schedule alerts

let audioCtx: AudioContext | null = null;
let activeGainNode: GainNode | null = null;
let isPlayingAlarm = false;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Plays a bright, attention-grabbing academic chime.
 * Synthesized dual-chime pattern (repeats 2-3 times) that is distinct, audible, and pleasant.
 */
export function playChimeSound(volume: number = 0.75): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(Math.min(Math.max(volume, 0), 1), now);
    masterGain.connect(ctx.destination);

    // Chime notes: E5 (659.25), G#5 (830.61), B5 (987.77), E6 (1318.51)
    const pattern = [
      { freq: 659.25, timeOffset: 0.0, duration: 0.3 },
      { freq: 830.61, timeOffset: 0.15, duration: 0.3 },
      { freq: 987.77, timeOffset: 0.30, duration: 0.4 },
      { freq: 1318.51, timeOffset: 0.45, duration: 0.7 },
      // Second phrase
      { freq: 830.61, timeOffset: 1.1, duration: 0.25 },
      { freq: 1318.51, timeOffset: 1.3, duration: 0.8 },
    ];

    pattern.forEach(({ freq, timeOffset, duration }) => {
      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + timeOffset);

      // Add slight harmonic overtone
      const overtone = ctx.createOscillator();
      const overtoneGain = ctx.createGain();
      overtone.type = 'triangle';
      overtone.frequency.setValueAtTime(freq * 2, now + timeOffset);
      overtoneGain.gain.setValueAtTime(0.15, now + timeOffset);
      overtoneGain.gain.exponentialRampToValueAtTime(0.001, now + timeOffset + duration);

      // Bell envelope: instant attack, exponential decay
      noteGain.gain.setValueAtTime(0.001, now + timeOffset);
      noteGain.gain.linearRampToValueAtTime(0.4, now + timeOffset + 0.02);
      noteGain.gain.exponentialRampToValueAtTime(0.001, now + timeOffset + duration);

      osc.connect(noteGain);
      overtone.connect(overtoneGain);
      noteGain.connect(masterGain);
      overtoneGain.connect(masterGain);

      osc.start(now + timeOffset);
      osc.stop(now + timeOffset + duration);
      overtone.start(now + timeOffset);
      overtone.stop(now + timeOffset + duration);
    });
  } catch (err) {
    console.warn('Web Audio playback failed or blocked by autoplay policy:', err);
  }
}

/**
 * Triggers an alarm sound that can loop or play an extended wake-up sequence
 */
export function triggerFullAlarm(volume: number = 0.8): () => void {
  try {
    playChimeSound(volume);
    // Play a secondary confirmation alert 2 seconds later if not stopped
    const timer = setTimeout(() => {
      playChimeSound(volume * 0.9);
    }, 2200);

    return () => {
      clearTimeout(timer);
    };
  } catch {
    return () => {};
  }
}

/**
 * Pre-unlocks audio context on user click/interaction
 */
export function unlockAudioContext(): void {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
  } catch {
    // Ignore context failure
  }
}
