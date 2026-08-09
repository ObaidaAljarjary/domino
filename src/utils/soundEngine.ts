// Web Audio API & Web Speech Synthesizer for Iraqi Chaikhana & Street Ambiance

class SoundEngine {
  private ctx: AudioContext | null = null;
  public soundEnabled = true;
  public ambientEnabled = false;

  private ambientGainNode: GainNode | null = null;
  private ambientSources: Array<AudioNode> = [];
  private ambientInterval: number | null = null;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Realistic Domino Tile Placement Slam ("طك الضربة")
  public playTileSlam() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // Heavy wooden thud
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.12);

    gain.gain.setValueAtTime(0.7, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.12);

    // Sharp wooden click
    const bufferSize = this.ctx.sampleRate * 0.05;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, t);
    filter.Q.setValueAtTime(3, t);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.6, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);

    whiteNoise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);

    whiteNoise.start(t);
    whiteNoise.stop(t + 0.05);
  }

  // Tile Shuffle Sound ("ململة القطع")
  public playTileShuffle() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    for (let i = 0; i < 6; i++) {
      setTimeout(() => {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400 + Math.random() * 300, t);

        gain.gain.setValueAtTime(0.15, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.04);
      }, i * 45);
    }
  }

  // Tea Glass Spoon Clink ("رنة استكان الشاي")
  public playTeaSpoonClink() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    const freqs = [2093, 3135.96, 4186]; // High glass chimes
    freqs.forEach((f, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, t + idx * 0.08);

      gain.gain.setValueAtTime(0.25, t + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.08 + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + idx * 0.08);
      osc.stop(t + idx * 0.08 + 0.35);
    });
  }

  // Pass sound ("باص")
  public playPassSound() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.linearRampToValueAtTime(140, t + 0.2);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.2);
  }

  // Lock Board Sound ("قفل")
  public playBlockSound() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    [100, 150, 200].forEach((freq) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.4);
    });
  }

  // Traditional Victory Jingle
  public playWinJingle() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const notes = [
      { f: 293.66, d: 0.15 },
      { f: 329.63, d: 0.15 },
      { f: 349.23, d: 0.15 },
      { f: 392.00, d: 0.15 },
      { f: 440.00, d: 0.25 },
      { f: 523.25, d: 0.4 },
    ];

    let startTime = this.ctx.currentTime;
    notes.forEach(({ f, d }) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, startTime);

      gain.gain.setValueAtTime(0.3, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + d);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + d);
      startTime += d * 0.9;
    });
  }

  // Iraqi Street & Cafe Voice Callouts (SpeechSynthesis with Arabic pitch)
  public speakIraqiPhrase(text: string) {
    if (!this.soundEnabled) return;
    if (!('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ar-IQ'; // Iraqi Arabic
      utterance.rate = 1.05;
      utterance.pitch = 0.95; // Slightly deeper cafe tone

      // Try finding Arabic voice
      const voices = window.speechSynthesis.getVoices();
      const arVoice = voices.find((v) => v.lang.includes('ar'));
      if (arVoice) utterance.voice = arVoice;

      window.speechSynthesis.speak(utterance);
    } catch {
      // SpeechSynthesis fallback
    }
  }

  // Start Background Chaikhana Cafe & Street Murmur Soundscape
  public toggleAmbientSoundscape(): boolean {
    this.ambientEnabled = !this.ambientEnabled;

    if (this.ambientEnabled) {
      this.startAmbient();
    } else {
      this.stopAmbient();
    }

    return this.ambientEnabled;
  }

  private startAmbient() {
    this.initCtx();
    if (!this.ctx) return;

    // Filtered pink noise for cafe room murmur
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.05;
      b6 = white * 0.115926;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, this.ctx.currentTime);

    this.ambientGainNode = this.ctx.createGain();
    this.ambientGainNode.gain.setValueAtTime(0.08, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(this.ambientGainNode);
    this.ambientGainNode.connect(this.ctx.destination);
    whiteNoise.start();

    this.ambientSources = [whiteNoise, filter, this.ambientGainNode];

    // Periodically trigger tea glass spoon chimes and ambient street voice calls
    this.ambientInterval = window.setInterval(() => {
      if (!this.ambientEnabled) return;

      const rand = Math.random();
      if (rand < 0.35) {
        this.playTeaSpoonClink();
      } else if (rand < 0.55) {
        const calls = [
          'شاي هي يا ولد!',
          'استكان شاي مخدر!',
          'دوش عراقي!',
          'هلا بالشباب!',
          'عاشت الأيادي!',
        ];
        const callText = calls[Math.floor(Math.random() * calls.length)];
        this.speakIraqiPhrase(callText);
      }
    }, 9000);
  }

  private stopAmbient() {
    if (this.ambientInterval) {
      clearInterval(this.ambientInterval);
      this.ambientInterval = null;
    }
    this.ambientSources.forEach((node) => {
      try {
        if ('stop' in node && typeof (node as AudioBufferSourceNode).stop === 'function') {
          (node as AudioBufferSourceNode).stop();
        }
        node.disconnect();
      } catch {
        // ignore
      }
    });
    this.ambientSources = [];
  }
}

export const soundEngine = new SoundEngine();
