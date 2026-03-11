"use client";

class TerminalAudio {
  private ctx: AudioContext | null = null;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  // A short, high-frequency "tick" mimicking a mechanical switch or terminal relay
  playKeystroke() {
    try {
      this.init();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      // Bandpass to give it a "plastic/click" resonance
      filter.type = "bandpass";
      filter.frequency.value = 1200 + Math.random() * 500;
      filter.Q.value = 1.5;

      osc.type = "sine";
      // Quick frequency drop creates a percussive transient
      osc.frequency.setValueAtTime(600 + Math.random() * 200, t);
      osc.frequency.exponentialRampToValueAtTime(100, t + 0.02);

      // Volume envelope
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.15, t + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.03);
    } catch {
      // Ignore audio errors if browser blocks it
    }
  }

  // A deeper, slightly longer "thud" with a bit of noise/distortion for the Enter key
  playEnter() {
    try {
      this.init();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "square";
      osc.frequency.setValueAtTime(150, t);
      osc.frequency.exponentialRampToValueAtTime(40, t + 0.08);

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.1, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.1);
    } catch {
      // Ignore errors
    }
  }
}

// Export a singleton instance
export const terminalAudio = typeof window !== "undefined" ? new TerminalAudio() : null;
