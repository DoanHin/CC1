/**
 * Speech and Sound synthesis service for Kéo Co Trí Tuệ
 * Handles Web Speech API with Vietnamese voice, chunking, and Web Audio API FX
 */

export interface SpeechProgressInfo {
  chunk: string;
  chunkIndex: number;
  totalChunks: number;
  isRulesPhase: boolean;
  activeRuleCard: 1 | 2 | 3 | null;
  progress: number;
  currentTime?: number;
  duration?: number;
}

class SoundAndSpeechService {
  private synth: SpeechSynthesis | null = null;
  private audioCtx: AudioContext | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private currentAudioElement: HTMLAudioElement | null = null;

  public isMuted: boolean = false;
  public isSpeaking: boolean = false;
  public isPaused: boolean = false;
  public activeChunk: string = '';

  private chunkQueue: string[] = [];
  private currentChunkIndex: number = 0;
  private onChunkChangeCallback: ((chunk: string) => void) | null = null;
  private onProgressCallback: ((info: SpeechProgressInfo) => void) | null = null;
  private onEndCallback: (() => void) | null = null;
  private voice: SpeechSynthesisVoice | null = null;
  private currentSessionId: number = 0;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.initVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.initVoices();
      }
    }
  }

  private initAudioContext() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  private initVoices() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    // Prefer Vietnamese voices
    const viVoice = voices.find(v => v.lang.startsWith('vi') || v.lang.includes('VIE') || v.name.toLowerCase().includes('vietnam') || v.name.toLowerCase().includes('vietnamese'));
    if (viVoice) {
      this.voice = viVoice;
    } else {
      // Fallback
      this.voice = voices.find(v => v.lang.includes('en') || v.default) || voices[0] || null;
    }
  }

  public getVoice(): SpeechSynthesisVoice | null {
    if (!this.voice && this.synth) {
      this.initVoices();
    }
    return this.voice;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stop();
    }
  }

  public stop() {
    this.currentSessionId++;
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch (e) {
        console.warn("Speech cancel error", e);
      }
    }
    if (this.currentAudioElement) {
      this.currentAudioElement.pause();
      this.currentAudioElement.currentTime = 0;
      this.currentAudioElement = null;
    }
    this.isSpeaking = false;
    this.isPaused = false;
    this.activeChunk = '';
    this.chunkQueue = [];
    this.currentChunkIndex = 0;
    if (this.onChunkChangeCallback) {
      this.onChunkChangeCallback('');
    }
    if (typeof window !== 'undefined') {
      delete (window as unknown as { __activeUtterance?: SpeechSynthesisUtterance }).__activeUtterance;
    }
  }

  public pause() {
    if (this.currentAudioElement) {
      this.currentAudioElement.pause();
      this.isPaused = true;
      this.isSpeaking = false;
      return;
    }
    if (this.synth && this.isSpeaking) {
      this.synth.pause();
      this.isPaused = true;
      this.isSpeaking = false;
    }
  }

  public resume() {
    if (this.isMuted) return;
    if (this.currentAudioElement) {
      this.currentAudioElement.play();
      this.isPaused = false;
      this.isSpeaking = true;
      return;
    }
    if (this.synth && this.isPaused) {
      this.synth.resume();
      this.isPaused = false;
      this.isSpeaking = true;
    }
  }

  /**
   * Speak a text string broken down into animated chunks
   */
  public speakTextChunks(
    textOrParagraphs: string | string[],
    options?: {
      rate?: number;
      pitch?: number;
      audioUrl?: string;
      onChunkChange?: (chunk: string) => void;
      onProgress?: (info: SpeechProgressInfo) => void;
      onEnd?: () => void;
    }
  ) {
    this.stop();
    if (this.isMuted) {
      if (options?.onEnd) options.onEnd();
      return;
    }

    // Split into chunks for display
    let chunks: string[] = [];
    if (Array.isArray(textOrParagraphs)) {
      chunks = textOrParagraphs;
    } else {
      chunks = textOrParagraphs
        .split(/\n+/)
        .map(p => p.trim())
        .filter(p => p.length > 0);
    }

    // If a dedicated audioUrl is provided and valid, play it and synchronize subtitle chunks
    if (options?.audioUrl && options.audioUrl.trim().length > 0) {
      this.playCustomAudio(
        options.audioUrl,
        options.onEnd,
        options.onChunkChange,
        options.onProgress,
        chunks
      );
      return;
    }

    if (!this.synth) {
      if (options?.onEnd) options.onEnd();
      return;
    }

    if (chunks.length === 0) {
      if (options?.onEnd) options.onEnd();
      return;
    }

    this.chunkQueue = chunks;
    this.currentChunkIndex = 0;
    this.onChunkChangeCallback = options?.onChunkChange || null;
    this.onProgressCallback = options?.onProgress || null;
    this.onEndCallback = options?.onEnd || null;

    this.playNextChunk(options?.rate ?? 1.02, options?.pitch ?? 1.05);
  }

  private playCustomAudio(
    audioUrl: string,
    onEnd?: () => void,
    onChunkChange?: (chunk: string) => void,
    onProgress?: (info: SpeechProgressInfo) => void,
    chunks: string[] = []
  ) {
    try {
      const audio = new Audio(audioUrl);
      this.currentAudioElement = audio;
      this.isSpeaking = true;
      this.isPaused = false;

      // Character-weighted chunk timing
      const chunkLengths = chunks.map(c => Math.max(c.length, 15));
      const totalChars = chunkLengths.reduce((a, b) => a + b, 0) || 1;
      const cumulativeBounds: number[] = [];
      let runningSum = 0;
      for (let i = 0; i < chunkLengths.length; i++) {
        runningSum += chunkLengths[i];
        cumulativeBounds.push(runningSum / totalChars);
      }

      const initialChunk = chunks[0] || "Đang phát bản ghi âm...";
      if (onChunkChange) onChunkChange(initialChunk);
      if (onProgress) {
        onProgress({
          chunk: initialChunk,
          chunkIndex: 0,
          totalChunks: chunks.length,
          isRulesPhase: false,
          activeRuleCard: null,
          progress: 0,
          currentTime: 0,
          duration: 0
        });
      }

      audio.ontimeupdate = () => {
        if (!audio.duration || chunks.length === 0) return;
        const progress = Math.min(Math.max(audio.currentTime / audio.duration, 0), 0.999);
        
        let chunkIndex = 0;
        for (let i = 0; i < cumulativeBounds.length; i++) {
          if (progress <= cumulativeBounds[i]) {
            chunkIndex = i;
            break;
          }
        }

        const activeText = chunks[chunkIndex] || '';
        const lower = activeText.toLowerCase();

        // Check rules phase: either index >= 5 or keywords
        const isRules =
          chunkIndex >= 5 ||
          lower.includes('luật chơi') ||
          lower.includes('16 ô câu hỏi') ||
          lower.includes('thảo luận') ||
          lower.includes('câu hỏi phụ');

        let activeRuleCard: 1 | 2 | 3 | null = null;
        if (chunkIndex === 6 || lower.includes('16 ô câu hỏi') || lower.includes('lựa chọn một ô')) {
          activeRuleCard = 1;
        } else if (chunkIndex === 7 || lower.includes('thảo luận') || lower.includes('kéo được sợi dây')) {
          activeRuleCard = 2;
        } else if (chunkIndex === 8 || lower.includes('chiến thắng') || lower.includes('bằng nhau') || lower.includes('câu hỏi phụ')) {
          activeRuleCard = 3;
        }

        if (onChunkChange) {
          onChunkChange(activeText);
        }
        if (onProgress) {
          onProgress({
            chunk: activeText,
            chunkIndex,
            totalChunks: chunks.length,
            isRulesPhase: isRules,
            activeRuleCard,
            progress,
            currentTime: audio.currentTime,
            duration: audio.duration
          });
        }
      };

      audio.onended = () => {
        this.isSpeaking = false;
        this.currentAudioElement = null;
        if (onChunkChange) onChunkChange("");
        if (onProgress) {
          onProgress({
            chunk: "",
            chunkIndex: chunks.length,
            totalChunks: chunks.length,
            isRulesPhase: true,
            activeRuleCard: null,
            progress: 1,
            currentTime: audio.duration,
            duration: audio.duration
          });
        }
        if (onEnd) onEnd();
      };

      audio.onerror = () => {
        console.warn("Could not play custom audio");
        this.isSpeaking = false;
        this.currentAudioElement = null;
        if (onEnd) onEnd();
      };

      audio.play().catch(e => {
        console.warn("Audio play prevented", e);
        if (onEnd) onEnd();
      });
    } catch (err) {
      console.warn("Audio playback error", err);
      if (onEnd) onEnd();
    }
  }

  private playNextChunk(rate: number, pitch: number) {
    if (this.currentChunkIndex >= this.chunkQueue.length) {
      this.isSpeaking = false;
      this.activeChunk = '';
      if (this.onChunkChangeCallback) this.onChunkChangeCallback('');
      if (this.onProgressCallback) {
        this.onProgressCallback({
          chunk: '',
          chunkIndex: this.chunkQueue.length,
          totalChunks: this.chunkQueue.length,
          isRulesPhase: true,
          activeRuleCard: null,
          progress: 1
        });
      }
      if (this.onEndCallback) this.onEndCallback();
      return;
    }

    const chunk = this.chunkQueue[this.currentChunkIndex];
    this.activeChunk = chunk;
    this.isSpeaking = true;
    this.isPaused = false;
    
    const lower = chunk.toLowerCase();
    const isRules =
      this.currentChunkIndex >= 5 ||
      lower.includes('luật chơi') ||
      lower.includes('16 ô câu hỏi') ||
      lower.includes('thảo luận') ||
      lower.includes('câu hỏi phụ');

    let activeRuleCard: 1 | 2 | 3 | null = null;
    if (this.currentChunkIndex === 6 || lower.includes('16 ô câu hỏi') || lower.includes('lựa chọn một ô')) {
      activeRuleCard = 1;
    } else if (this.currentChunkIndex === 7 || lower.includes('thảo luận') || lower.includes('kéo được sợi dây')) {
      activeRuleCard = 2;
    } else if (this.currentChunkIndex === 8 || lower.includes('chiến thắng') || lower.includes('câu hỏi phụ')) {
      activeRuleCard = 3;
    }

    if (this.onChunkChangeCallback) {
      this.onChunkChangeCallback(chunk);
    }
    if (this.onProgressCallback) {
      this.onProgressCallback({
        chunk,
        chunkIndex: this.currentChunkIndex,
        totalChunks: this.chunkQueue.length,
        isRulesPhase: isRules,
        activeRuleCard,
        progress: (this.currentChunkIndex + 1) / this.chunkQueue.length
      });
    }

    if (!this.voice) {
      this.initVoices();
    }

    const utterance = new SpeechSynthesisUtterance(chunk);
    utterance.lang = 'vi-VN';
    if (this.voice) {
      utterance.voice = this.voice;
    }
    utterance.rate = rate;
    utterance.pitch = pitch;

    // Prevent GC in Chromium
    if (typeof window !== 'undefined') {
      (window as unknown as { __activeUtterance?: SpeechSynthesisUtterance }).__activeUtterance = utterance;
    }

    utterance.onend = () => {
      this.currentChunkIndex++;
      // Natural breath pause between sentences
      setTimeout(() => {
        if (this.isSpeaking) {
          this.playNextChunk(rate, pitch);
        }
      }, 320);
    };

    utterance.onerror = (e) => {
      if (e.error === 'interrupted' || e.error === 'canceled') {
        return;
      }
      console.warn("Utterance error:", e);
      this.currentChunkIndex++;
      if (this.isSpeaking) {
        this.playNextChunk(rate, pitch);
      }
    };

    this.currentUtterance = utterance;
    try {
      this.synth?.speak(utterance);
    } catch (e) {
      console.warn("Speech speak error", e);
    }
  }

  /**
   * Speak a question followed by all 4 options (A, B, C, D) and team prompt
   */
  public speakQuestionAndOptions(
    questionNumber: number,
    questionText: string,
    options: { A: string; B: string; C: string; D: string },
    teamName: string,
    settings?: {
      audioUrl?: string;
      rate?: number;
      pitch?: number;
      onPartChange?: (part: 'intro' | 'question' | 'A' | 'B' | 'C' | 'D' | 'prompt', text: string) => void;
      onEnd?: () => void;
    }
  ) {
    this.stop();
    if (this.isMuted) {
      if (settings?.onEnd) settings.onEnd();
      return;
    }

    const sessionId = ++this.currentSessionId;

    // Structured parts
    const parts: Array<{ part: 'intro' | 'question' | 'A' | 'B' | 'C' | 'D' | 'prompt'; text: string }> = [
      { part: 'intro', text: `Câu hỏi số ${questionNumber}.` },
      { part: 'question', text: questionText },
      { part: 'A', text: `Đáp án A: ${options.A}` },
      { part: 'B', text: `Đáp án B: ${options.B}` },
      { part: 'C', text: `Đáp án C: ${options.C}` },
      { part: 'D', text: `Đáp án D: ${options.D}` }
    ];

    // If custom audio is uploaded for this question, play it
    if (settings?.audioUrl && settings.audioUrl.trim().length > 0) {
      const chunks = parts.map(p => p.text);
      this.playCustomAudio(
        settings.audioUrl,
        () => {
          if (this.currentSessionId === sessionId && settings.onEnd) {
            settings.onEnd();
          }
        },
        (chunk) => {
          if (this.currentSessionId !== sessionId) return;
          const match = parts.find(p => p.text === chunk);
          if (match && settings.onPartChange) {
            settings.onPartChange(match.part, match.text);
          }
        },
        undefined,
        chunks
      );
      return;
    }

    if (!this.synth) {
      if (settings?.onEnd) settings.onEnd();
      return;
    }

    let currentIndex = 0;
    this.isSpeaking = true;
    this.isPaused = false;

    const playPart = () => {
      if (this.currentSessionId !== sessionId || !this.isSpeaking) return;

      if (currentIndex >= parts.length) {
        this.isSpeaking = false;
        if (settings?.onPartChange) settings.onPartChange('prompt', '');
        if (settings?.onEnd) settings.onEnd();
        return;
      }

      const item = parts[currentIndex];
      if (settings?.onPartChange) {
        settings.onPartChange(item.part, item.text);
      }

      if (!this.voice) {
        this.initVoices();
      }

      const utterance = new SpeechSynthesisUtterance(item.text);
      utterance.lang = 'vi-VN';
      if (this.voice) {
        utterance.voice = this.voice;
      }
      utterance.rate = settings?.rate ?? 1.08;
      utterance.pitch = settings?.pitch ?? 1.05;

      if (typeof window !== 'undefined') {
        (window as unknown as { __activeUtterance?: SpeechSynthesisUtterance }).__activeUtterance = utterance;
      }

      utterance.onend = () => {
        if (this.currentSessionId !== sessionId || !this.isSpeaking) return;
        currentIndex++;
        if (currentIndex >= parts.length) {
          this.isSpeaking = false;
          if (settings?.onPartChange) settings.onPartChange('prompt', '');
          if (settings?.onEnd) settings.onEnd();
          return;
        }
        setTimeout(() => {
          if (this.currentSessionId === sessionId && this.isSpeaking) {
            playPart();
          }
        }, item.part === 'question' ? 260 : 160);
      };

      utterance.onerror = (e) => {
        if (this.currentSessionId !== sessionId || !this.isSpeaking) return;
        if (e.error === 'interrupted' || e.error === 'canceled') {
          // Session was stopped or replaced, do not skip or trigger onEnd
          return;
        }
        console.warn("Utterance error:", e.error);
        currentIndex++;
        if (currentIndex < parts.length) {
          setTimeout(() => {
            if (this.currentSessionId === sessionId && this.isSpeaking) {
              playPart();
            }
          }, 100);
        } else {
          this.isSpeaking = false;
          if (settings?.onPartChange) settings.onPartChange('prompt', '');
          if (settings?.onEnd) settings.onEnd();
        }
      };

      this.currentUtterance = utterance;
      try {
        if (this.synth.paused) {
          this.synth.resume();
        }
        this.synth.speak(utterance);
      } catch (e) {
        console.warn("Speak error:", e);
        currentIndex++;
        if (currentIndex < parts.length) {
          playPart();
        } else {
          this.isSpeaking = false;
          if (settings?.onEnd) settings.onEnd();
        }
      }
    };

    // 60ms settling delay after cancel() ensures Chromium speech synthesis queue is cleanly ready
    setTimeout(() => {
      if (this.currentSessionId === sessionId && this.isSpeaking) {
        playPart();
      }
    }, 60);
  }

  /**
   * Speak a single option on demand (e.g. when teacher/host clicks mini-speaker on an option)
   */
  public speakSingleOption(optionKey: 'A' | 'B' | 'C' | 'D', text: string) {
    this.stop();
    if (this.isMuted || !this.synth) return;

    if (!this.voice) {
      this.initVoices();
    }

    const utterance = new SpeechSynthesisUtterance(`Phương án ${optionKey}: ${text}`);
    utterance.lang = 'vi-VN';
    if (this.voice) {
      utterance.voice = this.voice;
    }
    utterance.rate = 0.92;
    utterance.pitch = 1.05;

    this.isSpeaking = true;
    utterance.onend = () => {
      this.isSpeaking = false;
    };
    utterance.onerror = () => {
      this.isSpeaking = false;
    };

    try {
      this.synth.speak(utterance);
    } catch (e) {
      console.warn("Speak single option error:", e);
    }
  }

  // --- SOUND EFFECTS (Web Audio API Synthesizer) ---

  /**
   * Cheerful Ting chimes for correct answer
   */
  public playCorrectSound(customUrl?: string) {
    if (this.isMuted) return;
    if (customUrl && customUrl.trim().length > 0) {
      const audio = new Audio(customUrl);
      audio.play().catch(() => this.playSynthCorrect());
      return;
    }
    this.playSynthCorrect();
  }

  private playSynthCorrect() {
    this.initAudioContext();
    if (!this.audioCtx) return;
    const now = this.audioCtx.currentTime;

    // Harmonic bell sequence: C6 (1046Hz), E6 (1318Hz), G6 (1567Hz), C7 (2093Hz)
    const notes = [1046.5, 1318.51, 1567.98, 2093.0];
    notes.forEach((freq, index) => {
      if (!this.audioCtx) return;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + index * 0.08);

      gain.gain.setValueAtTime(0, now + index * 0.08);
      gain.gain.linearRampToValueAtTime(0.3, now + index * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.08 + 0.45);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now + index * 0.08);
      osc.stop(now + index * 0.08 + 0.5);
    });
  }

  /**
   * Gentle encouraging sound for wrong answer
   */
  public playWrongSound(customUrl?: string) {
    if (this.isMuted) return;
    if (customUrl && customUrl.trim().length > 0) {
      const audio = new Audio(customUrl);
      audio.play().catch(() => this.playSynthWrong());
      return;
    }
    this.playSynthWrong();
  }

  private playSynthWrong() {
    this.initAudioContext();
    if (!this.audioCtx) return;
    const now = this.audioCtx.currentTime;

    // Soft two-tone downward chime (Eb4 -> C4), gentle and encouraging
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(311.13, now);
    osc.frequency.exponentialRampToValueAtTime(261.63, now + 0.25);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.35);
  }

  /**
   * Tug pull exertion audio accent
   */
  public playTugPullSound() {
    if (this.isMuted) return;
    this.initAudioContext();
    if (!this.audioCtx) return;
    const now = this.audioCtx.currentTime;

    // Whoosh / snap tension sound
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.2);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  /**
   * Alert chime when switching from 20s thinking to 10s answering phase
   */
  public playAnswerPhaseAlert() {
    if (this.isMuted) return;
    this.initAudioContext();
    if (!this.audioCtx) return;
    const now = this.audioCtx.currentTime;

    // Vibrant energetic double chime: F5 (698Hz) -> C6 (1046Hz)
    [698.46, 1046.5].forEach((freq, i) => {
      if (!this.audioCtx) return;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.11);

      gain.gain.setValueAtTime(0, now + i * 0.11);
      gain.gain.linearRampToValueAtTime(0.25, now + i * 0.11 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.11 + 0.35);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now + i * 0.11);
      osc.stop(now + i * 0.11 + 0.38);
    });
  }

  /**
   * Crisp digital "pip" beep sound when question finishes reading to alert everyone to start timer
   */
  public playQuestionEndPip() {
    if (this.isMuted) return;
    this.initAudioContext();
    if (!this.audioCtx) return;
    const now = this.audioCtx.currentTime;

    // Crisp high-pitch electronic "PIP" beep (1046.5Hz C6 -> 1174.6Hz D6 upward digital chirp)
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1046.5, now);
    osc.frequency.linearRampToValueAtTime(1174.66, now + 0.09);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.38, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.24);
  }

  /**
   * Victory triumphant fanfare
   */
  public playVictoryFanfare(customUrl?: string) {
    if (this.isMuted) return;
    if (customUrl && customUrl.trim().length > 0) {
      const audio = new Audio(customUrl);
      audio.play().catch(() => this.playSynthFanfare());
      return;
    }
    this.playSynthFanfare();
  }

  private playSynthFanfare() {
    this.initAudioContext();
    if (!this.audioCtx) return;
    const now = this.audioCtx.currentTime;

    // Triumphant trumpet arpeggio: C5, E5, G5, C6 (extended)
    const melody = [
      { freq: 523.25, time: 0, dur: 0.15 },
      { freq: 523.25, time: 0.15, dur: 0.15 },
      { freq: 523.25, time: 0.30, dur: 0.15 },
      { freq: 659.25, time: 0.45, dur: 0.35 },
      { freq: 783.99, time: 0.85, dur: 0.25 },
      { freq: 1046.50, time: 1.15, dur: 0.75 },
    ];

    melody.forEach(item => {
      if (!this.audioCtx) return;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(item.freq, now + item.time);

      gain.gain.setValueAtTime(0, now + item.time);
      gain.gain.linearRampToValueAtTime(0.28, now + item.time + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + item.time + item.dur);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now + item.time);
      osc.stop(now + item.time + item.dur);
    });
  }

  /**
   * Countdown timer tick sound (gentle blip for last seconds)
   */
  public playTimerTickSound() {
    if (this.isMuted) return;
    this.initAudioContext();
    if (!this.audioCtx) return;
    const now = this.audioCtx.currentTime;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.04);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  /**
   * Time-up gong / alarm sound when 20s expires
   */
  public playTimeUpSound() {
    if (this.isMuted) return;
    this.initAudioContext();
    if (!this.audioCtx) return;
    const now = this.audioCtx.currentTime;

    // Dual-tone buzzer: 440Hz -> 330Hz
    [440, 330].forEach((freq, i) => {
      if (!this.audioCtx) return;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + i * 0.12);

      gain.gain.setValueAtTime(0.2, now + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.28);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now + i * 0.12);
      osc.stop(now + i * 0.12 + 0.3);
    });
  }
}

export const speechService = new SoundAndSpeechService();
