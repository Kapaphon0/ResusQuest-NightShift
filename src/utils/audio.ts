/**
 * ResusQuest Global Web Audio Engine
 * Lazily initialized to respect browser autoplay policies.
 * Generates synthetic acoustic cardiac telemetry, clinical monitor alarms, and tactile feedback.
 */

class AudioManager {
  private ctx: AudioContext | null = null;
  private _isMuted: boolean = false;

  constructor() {
    // Attempt reading initial mute state from localStorage if available
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = window.localStorage.getItem('resusquest_muted');
        if (stored !== null) {
          this._isMuted = stored === 'true';
        }
      }
    } catch {
      // LocalStorage access restricted in some iframes
      this._isMuted = false;
    }
  }

  public get isMuted(): boolean {
    return this._isMuted;
  }

  public toggleMute(): boolean {
    this._isMuted = !this._isMuted;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('resusquest_muted', String(this._isMuted));
      }
    } catch {
      // Ignore storage errors
    }
    return this._isMuted;
  }

  /**
   * Lazily initializes or resumes the AudioContext upon user gesture.
   */
  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {
        // AudioContext resume will succeed upon direct user interaction
      });
    }

    return this.ctx;
  }

  /**
   * Plays a realistic dual-tone cardiac cycle ("lub-dub").
   * In critical mode or severe tachy/bradycardia, emits a high-urgency telemetry monitor beep.
   */
  public playHeartbeat(bpm: number = 75, isCritical: boolean = false): void {
    if (this._isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const isTachy = bpm > 120;
    const isBrady = bpm < 50;
    const severe = isCritical || isTachy || isBrady;

    // First heart sound (S1 - "Lub")
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = severe ? 'triangle' : 'sine';
    osc1.frequency.setValueAtTime(severe ? 95 : 65, now);
    osc1.frequency.exponentialRampToValueAtTime(severe ? 55 : 35, now + 0.08);

    gain1.gain.setValueAtTime(0.35, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.1);

    // Second heart sound (S2 - "Dub", ~120ms later)
    const delay = Math.max(0.08, 0.15 * (75 / Math.max(bpm, 40)));
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = severe ? 'triangle' : 'sine';
    osc2.frequency.setValueAtTime(severe ? 110 : 80, now + delay);
    osc2.frequency.exponentialRampToValueAtTime(severe ? 65 : 45, now + delay + 0.07);

    gain2.gain.setValueAtTime(0.25, now + delay);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.08);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc2.start(now + delay);
    osc2.stop(now + delay + 0.09);

    // If critical, overlay sharp ED pulse-ox telemetry tone
    if (severe) {
      const beepOsc = ctx.createOscillator();
      const beepGain = ctx.createGain();
      beepOsc.type = 'sine';
      beepOsc.frequency.setValueAtTime(isBrady ? 520 : 880, now);
      beepGain.gain.setValueAtTime(0.12, now);
      beepGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      beepOsc.connect(beepGain);
      beepGain.connect(ctx.destination);

      beepOsc.start(now);
      beepOsc.stop(now + 0.07);
    }
  }

  /**
   * Ascending clinical triad chime for successful interventions / correct triage.
   */
  public playSuccess(): void {
    if (this._isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    const stepDuration = 0.06;

    notes.forEach((freq, idx) => {
      const noteTime = now + idx * stepDuration;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.18, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.2);
    });
  }

  /**
   * Urgent emergency monitor crash alert (rapid high-priority double pulse).
   */
  public playAlarm(): void {
    if (this._isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const pulses = [0, 0.12];

    pulses.forEach((offset) => {
      const pulseTime = now + offset;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(987.77, pulseTime); // B5 urgent monitor frequency
      osc.frequency.exponentialRampToValueAtTime(880, pulseTime + 0.08);

      // Lowpass filter to soften the sawtooth into an authentic monitor sound
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1800, pulseTime);

      gain.gain.setValueAtTime(0.22, pulseTime);
      gain.gain.exponentialRampToValueAtTime(0.001, pulseTime + 0.09);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(pulseTime);
      osc.stop(pulseTime + 0.1);
    });
  }

  /**
   * Single crisp ED pulse-ox or monitor telemetry beep.
   */
  public playMonitorBeep(pitch: number = 660): void {
    if (this._isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(pitch, now);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  /**
   * Tactile perk activation sound (clean futuristic tactical frequency sweep).
   */
  public playPerkEquipped(): void {
    if (this._isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(960, now + 0.18);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.linearRampToValueAtTime(0.28, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.23);
  }

  /**
   * Warm debrief resolution chord for completing a shift bed or review.
   */
  public playDebriefChime(): void {
    if (this._isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Warm Major 9th chord voicing (F3, C4, A4, E5)
    const frequencies = [174.61, 261.63, 440.0, 659.25];

    frequencies.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.85);
    });
  }

  /**
   * Crisp, quick dual-tone pop for XP gain.
   */
  public playXpChime(): void {
    if (this._isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [659.25, 987.77]; // E5 -> B5 quick chime
    notes.forEach((freq, idx) => {
      const noteTime = now + idx * 0.05;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.12, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.14);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.15);
    });
  }

  /**
   * Triumphant fanfare chord for Level-Up celebration.
   */
  public playLevelUp(): void {
    if (this._isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Arpeggiated C-Major upward flourish into resolving harmony (C5, E5, G5, C6)
    const arpeggio = [523.25, 659.25, 783.99, 1046.5];
    arpeggio.forEach((freq, idx) => {
      const noteTime = now + idx * 0.07;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.18, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.38);
    });

    // Sustained celebratory resolution chord
    const chordTime = now + 0.28;
    const chordNotes = [523.25, 659.25, 783.99, 1046.5];
    chordNotes.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, chordTime);

      gain.gain.setValueAtTime(0.14, chordTime);
      gain.gain.exponentialRampToValueAtTime(0.001, chordTime + 1.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(chordTime);
      osc.stop(chordTime + 1.15);
    });
  }

  /**
   * Crisp tactile feedback tick for button presses, equipment swaps, and UI interactions.
   */
  public playTelemetryClick(): void {
    if (this._isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.025);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.028);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.03);
  }

  /**
   * Sharp alert pulse for high-urgency notifications or clinical deterioration warnings.
   */
  public playAlarmPulse(): void {
    this.playAlarm();
  }

  /**
   * Warning buzz tone for clinical cautions or contraindications.
   */
  public playWarningTone(): void {
    if (this._isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.12);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.15);
  }
}

export const audio = new AudioManager();
