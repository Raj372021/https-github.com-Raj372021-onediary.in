// Utility to play payment success notification tone using Web Audio API
export const playPaymentSuccessSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    
    const ctx = new AudioContextClass();

    // Pleasant 4-note payment success melody (Paytm / PhonePe style chime)
    // C5 (523.25Hz), E5 (659.25Hz), G5 (783.99Hz), C6 (1046.50Hz)
    const notes = [
      { freq: 523.25, time: 0, duration: 0.12 },
      { freq: 659.25, time: 0.12, duration: 0.12 },
      { freq: 783.99, time: 0.24, duration: 0.15 },
      { freq: 1046.50, time: 0.39, duration: 0.45 }
    ];

    notes.forEach((n) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(n.freq, ctx.currentTime + n.time);

      gain.gain.setValueAtTime(0, ctx.currentTime + n.time);
      gain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + n.time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + n.time + n.duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + n.time);
      osc.stop(ctx.currentTime + n.time + n.duration + 0.05);
    });
  } catch (e) {
    console.error("Audio playback error:", e);
  }
};
