/**
 * Web Audio API synthesizer for the Fire Alarm Buzzer simulation.
 * Works seamlessly in all modern browsers without external audio files.
 */
class BuzzerAudioSynthesizer {
  private audioCtx: AudioContext | null = null;
  private oscillator: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private intervalId: number | null = null;
  private isBeeping: boolean = false;
  private isMuted: boolean = false;

  private initContext() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stop();
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public getIsBeeping(): boolean {
    return this.isBeeping;
  }

  public startAlertTone(pattern: 'warning' | 'critical' = 'critical') {
    if (this.isMuted) return;
    this.initContext();
    if (!this.audioCtx) return;

    if (this.isBeeping) return;
    this.isBeeping = true;

    const intervalTime = pattern === 'critical' ? 240 : 600;
    const toneFreq = pattern === 'critical' ? 2400 : 1200;

    let toneState = false;

    this.intervalId = window.setInterval(() => {
      if (this.isMuted) {
        this.stop();
        return;
      }
      if (!this.audioCtx) return;

      try {
        if (!toneState) {
          const osc = this.audioCtx.createOscillator();
          const gain = this.audioCtx.createGain();

          osc.type = pattern === 'critical' ? 'sawtooth' : 'sine';
          osc.frequency.setValueAtTime(toneFreq, this.audioCtx.currentTime);

          gain.gain.setValueAtTime(0.12, this.audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + (intervalTime / 1000) * 0.7);

          osc.connect(gain);
          gain.connect(this.audioCtx.destination);

          osc.start();
          osc.stop(this.audioCtx.currentTime + (intervalTime / 1000) * 0.75);
          toneState = true;
        } else {
          toneState = false;
        }
      } catch (e) {
        console.warn('Audio tone error:', e);
      }
    }, intervalTime);
  }

  public stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isBeeping = false;
  }

  public playSingleBeep(frequency = 1000, durationMs = 150) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.audioCtx) return;

    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, this.audioCtx.currentTime);

      gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + durationMs / 1000);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + durationMs / 1000);
    } catch (e) {
      console.warn('Single beep error:', e);
    }
  }
}

export const buzzerAudio = new BuzzerAudioSynthesizer();
