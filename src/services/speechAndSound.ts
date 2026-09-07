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

/**
 * Format question speech text so that the question number and full question text
 * are spoken together clearly without interruption or skipping.
 */
export function formatQuestionSpeechText(questionNumber: number, questionText: string): string {
  const clean = questionText
    .replace(/[“”"']/g, ' ')
    .replace(/[–—]/g, ' - ')
    .replace(/\bTHPT\b/g, 'Trung học phổ thông')
    .replace(/\s+/g, ' ')
    .trim();
  return `Câu hỏi số ${questionNumber}: ${clean}`;
}

/**
 * Clean up text for natural Vietnamese text-to-speech pronunciation
 */
export function cleanSpeechText(text: string): string {
  return text
    .replace(/[“”"']/g, ' ')
    .replace(/[–—]/g, ' - ')
    .replace(/\bTHPT\b/g, 'Trung học phổ thông')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Generate high-fidelity Google Vietnamese TTS audio stream URL
 */
export function getGoogleTTSUrl(text: string): string {
  const clean = cleanSpeechText(text)
    .replace(/<[^>]+>/g, ' ')
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(clean)}&tl=vi&client=tw-ob`;
}

/**
 * Split text safely into chunks <= maxLen characters for reliable TTS streaming
 */
export function splitTextForTTS(text: string, maxLen = 140): string[] {
  const clean = text
    .replace(/<[^>]+>/g, ' ')
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!clean) return [];
  if (clean.length <= maxLen) return [clean];

  const words = clean.split(' ');
  const chunks: string[] = [];
  let current = '';

  for (const word of words) {
    if ((current + ' ' + word).trim().length <= maxLen) {
      current = (current + ' ' + word).trim();
    } else {
      if (current) chunks.push(current);
      current = word;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

/**
 * Singleton state for Vietnamese voice
 */
let vietnameseVoice: SpeechSynthesisVoice | null = null;
let isVoicesListenerAttached = false;

// Remove any existing toast if present in DOM
if (typeof document !== 'undefined') {
  const existingToast = document.getElementById('no-vi-voice-toast');
  if (existingToast) existingToast.remove();
}

/**
 * Discover and return only genuine Vietnamese voice.
 * Never return an English voice or the OS/browser default non-Vietnamese voice.
 */
export function loadVietnameseVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    vietnameseVoice = null;
    return null;
  }

  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) {
    return null;
  }

  // 1. Priority 1: Exact match "vi-VN" (case-insensitive)
  const exactVi = voices.find(voice => {
    const lang = (voice.lang || '').toLowerCase().replace(/_/g, '-');
    return lang === 'vi-vn';
  });
  if (exactVi) {
    vietnameseVoice = exactVi;
    return exactVi;
  }

  // 2. Priority 2: Language code starts with "vi" or "vie"
  const startVi = voices.find(voice => {
    const lang = (voice.lang || '').toLowerCase().replace(/_/g, '-');
    return lang.startsWith('vi') || lang.startsWith('vie');
  });
  if (startVi) {
    vietnameseVoice = startVi;
    return startVi;
  }

  // 3. Priority 3: Name explicitly indicates Vietnamese
  const nameVi = voices.find(voice => {
    const name = (voice.name || '').toLowerCase();
    return (
      name.includes('vietnam') ||
      name.includes('tiếng việt') ||
      name.includes('tieng viet') ||
      name.includes('vietnamese') ||
      name.includes('hoaimy') ||
      name.includes('namminh') ||
      name.includes('linh') ||
      name.includes('mai') ||
      name.includes('an')
    );
  });
  if (nameVi) {
    vietnameseVoice = nameVi;
    return nameVi;
  }

  // ABSOLUTE BAN: NEVER fallback to default non-Vietnamese voice or English voice!
  vietnameseVoice = null;
  return null;
}

/**
 * Handle asynchronous voice loading across browsers (Chrome, Edge, Cốc Cốc, Safari, Firefox)
 */
export function ensureVietnameseVoiceLoaded(): Promise<SpeechSynthesisVoice | null> {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return Promise.resolve(null);
  }

  const immediate = loadVietnameseVoice();
  if (immediate) {
    return Promise.resolve(immediate);
  }

  return new Promise((resolve) => {
    let resolved = false;

    const onVoices = () => {
      if (resolved) return;
      resolved = true;
      const v = loadVietnameseVoice();
      resolve(v);
    };

    if (window.speechSynthesis.getVoices().length > 0) {
      const v = loadVietnameseVoice();
      if (v) {
        resolved = true;
        resolve(v);
        return;
      }
    }

    window.speechSynthesis.addEventListener('voiceschanged', onVoices, { once: true });
    window.speechSynthesis.onvoiceschanged = onVoices;

    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve(loadVietnameseVoice());
      }
    }, 350);
  });
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  loadVietnameseVoice();
  if (!isVoicesListenerAttached) {
    const handleVoices = () => {
      loadVietnameseVoice();
    };
    window.speechSynthesis.addEventListener('voiceschanged', handleVoices);
    window.speechSynthesis.onvoiceschanged = handleVoices;
    isVoicesListenerAttached = true;
  }
}

/**
 * High-level Vietnamese speech helper adhering strictly to requirements:
 * - Always lang = "vi-VN"
 * - Always uses Vietnamese voice if available
 * - Uses online Vietnamese TTS if device lacks Vietnamese voice
 * - Never uses English voice
 */
export async function speakVietnamese(
  text: string,
  options?: {
    rate?: number;
    pitch?: number;
    volume?: number;
    onEnd?: () => void;
  }
) {
  if (!text || !text.trim()) {
    if (options?.onEnd) options.onEnd();
    return;
  }
  await speechService.speakSingleText(text, options);
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

  // TTS Engine preference: 'system' (device SpeechSynthesis) | 'online' (Google stream)
  public ttsEngine: 'system' | 'online' = 'system';
  public hasNativeViVoice: boolean = false;

  private chunkQueue: string[] = [];
  private currentChunkIndex: number = 0;
  private onChunkChangeCallback: ((chunk: string) => void) | null = null;
  private onProgressCallback: ((info: SpeechProgressInfo) => void) | null = null;
  private onEndCallback: (() => void) | null = null;
  private voice: SpeechSynthesisVoice | null = null;
  private currentSessionId: number = 0;

  constructor() {
    if (typeof window !== 'undefined') {
      const savedEngine = localStorage.getItem('keoco_tts_engine');
      if (savedEngine === 'system' || savedEngine === 'online') {
        this.ttsEngine = savedEngine;
      } else {
        this.ttsEngine = 'system';
      }

      if ('speechSynthesis' in window) {
        this.synth = window.speechSynthesis;
        this.initVoices();
        window.speechSynthesis.addEventListener('voiceschanged', () => this.initVoices());
      }
    }
  }

  public setTtsEngine(engine: 'online' | 'system') {
    this.ttsEngine = engine;
    if (typeof window !== 'undefined') {
      localStorage.setItem('keoco_tts_engine', engine);
    }
  }

  public getTtsEngine(): 'online' | 'system' {
    return this.ttsEngine;
  }

  public getHasNativeViVoice(): boolean {
    return this.hasNativeViVoice;
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
    this.voice = loadVietnameseVoice();
    this.hasNativeViVoice = Boolean(this.voice);
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
  public async speakTextChunks(
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

    // Split into chunks for display and audio streaming
    let chunks: string[] = [];
    const rawList = Array.isArray(textOrParagraphs)
      ? textOrParagraphs
      : textOrParagraphs.split(/\n+/);

    for (const item of rawList) {
      const trimmed = item.trim();
      if (!trimmed) continue;
      const sub = splitTextForTTS(trimmed, 140);
      chunks.push(...sub);
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

    if (chunks.length === 0) {
      if (options?.onEnd) options.onEnd();
      return;
    }

    this.chunkQueue = chunks;
    this.currentChunkIndex = 0;
    this.onChunkChangeCallback = options?.onChunkChange || null;
    this.onProgressCallback = options?.onProgress || null;
    this.onEndCallback = options?.onEnd || null;

    const viVoice = await ensureVietnameseVoiceLoaded();
    this.voice = viVoice;
    this.hasNativeViVoice = Boolean(viVoice);

    const rate = options?.rate ?? 0.95;
    const pitch = options?.pitch ?? 1.0;

    if (viVoice && this.synth && this.ttsEngine !== 'online') {
      this.playNextChunk(rate, pitch);
    } else {
      this.playNextChunkOnline(rate, pitch);
    }
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

  /**
   * Play text chunks using synchronized Google Vietnamese TTS audio stream
   */
  private playNextChunkOnline(rate: number, pitch: number) {
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

    const sessionId = this.currentSessionId;
    const url = getGoogleTTSUrl(chunk);
    const audio = new Audio(url);
    this.currentAudioElement = audio;

    // Preload next chunk audio for instantaneous transition
    if (this.currentChunkIndex + 1 < this.chunkQueue.length) {
      const nextAudio = new Audio(getGoogleTTSUrl(this.chunkQueue[this.currentChunkIndex + 1]));
      nextAudio.preload = 'auto';
    }

    audio.onended = () => {
      if (this.currentSessionId !== sessionId || !this.isSpeaking) return;
      this.currentChunkIndex++;
      setTimeout(() => {
        if (this.currentSessionId === sessionId && this.isSpeaking) {
          this.playNextChunkOnline(rate, pitch);
        }
      }, 260);
    };

    audio.onerror = () => {
      console.warn("Online chunk audio failed");
      if (this.currentSessionId !== sessionId || !this.isSpeaking) return;
      if (this.synth) {
        this.playNextChunk(rate, pitch);
      } else {
        this.isSpeaking = false;
        this.currentAudioElement = null;
        if (this.onEndCallback) this.onEndCallback();
      }
    };

    audio.play().catch(e => {
      console.warn("Online audio chunk play error", e);
      if (this.currentSessionId !== sessionId || !this.isSpeaking) return;
      if (this.synth) {
        this.playNextChunk(rate, pitch);
      } else {
        this.isSpeaking = false;
        this.currentAudioElement = null;
        if (this.onEndCallback) this.onEndCallback();
      }
    });
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

    if (!this.voice) {
      this.voice = loadVietnameseVoice();
    }

    const utterance = new SpeechSynthesisUtterance(chunk);
    utterance.lang = 'vi-VN';
    if (this.voice) {
      utterance.voice = this.voice;
    }
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = 1.0;

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
   * Speak a question followed by all 4 options (A, B, C, D) with question text guaranteed to read first
   */
  public async speakQuestionAndOptions(
    questionNumber: number,
    questionText: string,
    options: { A: string; B: string; C: string; D: string },
    teamName: string,
    settings?: {
      audioUrl?: string;
      rate?: number;
      pitch?: number;
      onPartChange?: (part: 'question' | 'A' | 'B' | 'C' | 'D' | 'prompt', text: string) => void;
      onEnd?: () => void;
    }
  ) {
    this.stop();
    if (this.isMuted) {
      if (settings?.onEnd) settings.onEnd();
      return;
    }

    const sessionId = ++this.currentSessionId;

    // Structured parts: Full question text is guaranteed to be the first part read
    const parts: Array<{ part: 'question' | 'A' | 'B' | 'C' | 'D'; text: string }> = [
      { part: 'question', text: formatQuestionSpeechText(questionNumber, questionText) },
      { part: 'A', text: `Đáp án A: ${cleanSpeechText(options.A)}` },
      { part: 'B', text: `Đáp án B: ${cleanSpeechText(options.B)}` },
      { part: 'C', text: `Đáp án C: ${cleanSpeechText(options.C)}` },
      { part: 'D', text: `Đáp án D: ${cleanSpeechText(options.D)}` }
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

    // Await voice resolution to detect genuine Vietnamese voice across browsers
    const viVoice = await ensureVietnameseVoiceLoaded();
    this.voice = viVoice;
    this.hasNativeViVoice = Boolean(viVoice);

    if (this.currentSessionId !== sessionId) return;

    let currentIndex = 0;
    this.isSpeaking = true;
    this.isPaused = false;

    // Use native Web Speech if synth is supported and engine is not explicitly online
    const useNativeSynth = Boolean(this.synth && this.ttsEngine !== 'online');

    if (useNativeSynth && this.synth) {
      let subIndex = 0;
      let currentSubChunks: string[] = [];

      const playSynthPart = () => {
        if (this.currentSessionId !== sessionId || !this.isSpeaking) return;

        if (currentIndex >= parts.length) {
          this.isSpeaking = false;
          if (settings?.onPartChange) settings.onPartChange('prompt', '');
          if (settings?.onEnd) settings.onEnd();
          return;
        }

        const item = parts[currentIndex];
        if (subIndex === 0) {
          currentSubChunks = splitTextForTTS(item.text, 140);
          if (settings?.onPartChange) {
            settings.onPartChange(item.part, item.text);
          }
        }

        if (subIndex >= currentSubChunks.length) {
          subIndex = 0;
          currentIndex++;
          if (currentIndex >= parts.length) {
            this.isSpeaking = false;
            if (settings?.onPartChange) settings.onPartChange('prompt', '');
            if (settings?.onEnd) settings.onEnd();
            return;
          }
          const pauseTime = item.part === 'question' ? 450 : 280;
          setTimeout(() => {
            if (this.currentSessionId === sessionId && this.isSpeaking) {
              playSynthPart();
            }
          }, pauseTime);
          return;
        }

        const textToRead = currentSubChunks[subIndex];
        const utterance = new SpeechSynthesisUtterance(textToRead);
        utterance.lang = 'vi-VN';
        if (viVoice) {
          utterance.voice = viVoice;
        }
        utterance.rate = settings?.rate ?? 0.95;
        utterance.pitch = settings?.pitch ?? 1.0;
        utterance.volume = 1.0;

        // Prevent garbage collection in Chromium
        if (typeof window !== 'undefined') {
          (window as unknown as { __activeUtterance?: SpeechSynthesisUtterance }).__activeUtterance = utterance;
        }

        utterance.onend = () => {
          if (this.currentSessionId !== sessionId || !this.isSpeaking) return;
          subIndex++;
          const innerPause = subIndex >= currentSubChunks.length ? (item.part === 'question' ? 450 : 280) : 120;
          if (subIndex >= currentSubChunks.length) {
            subIndex = 0;
            currentIndex++;
          }
          setTimeout(() => {
            if (this.currentSessionId === sessionId && this.isSpeaking) {
              playSynthPart();
            }
          }, innerPause);
        };

        utterance.onerror = (e) => {
          if (this.currentSessionId !== sessionId || !this.isSpeaking) return;
          if (e.error === 'interrupted' || e.error === 'canceled') {
            return;
          }
          console.warn("Speech part error:", e.error, "part:", item.part);
          subIndex++;
          if (subIndex >= currentSubChunks.length) {
            subIndex = 0;
            currentIndex++;
          }
          if (currentIndex < parts.length) {
            setTimeout(() => {
              if (this.currentSessionId === sessionId && this.isSpeaking) {
                playSynthPart();
              }
            }, 120);
          } else {
            this.isSpeaking = false;
            if (settings?.onEnd) settings.onEnd();
          }
        };

        this.currentUtterance = utterance;
        try {
          if (this.synth && this.synth.paused) {
            this.synth.resume();
          }
          this.synth?.speak(utterance);
        } catch (e) {
          console.warn("Speech speak error", e);
          subIndex++;
          if (subIndex >= currentSubChunks.length) {
            subIndex = 0;
            currentIndex++;
          }
          if (currentIndex < parts.length) {
            playSynthPart();
          } else {
            this.isSpeaking = false;
            if (settings?.onEnd) settings.onEnd();
          }
        }
      };

      // Kickoff speech with short initial delay
      setTimeout(() => {
        if (this.currentSessionId === sessionId && this.isSpeaking) {
          playSynthPart();
        }
      }, 80);
    } else {
      // Stream Google Vietnamese TTS: Guarantees authentic Vietnamese speech on ANY machine/device
      let subIndex = 0;
      let currentSubChunks: string[] = [];

      const playOnlinePart = () => {
        if (this.currentSessionId !== sessionId || !this.isSpeaking) return;

        if (currentIndex >= parts.length) {
          this.isSpeaking = false;
          this.currentAudioElement = null;
          if (settings?.onPartChange) settings.onPartChange('prompt', '');
          if (settings?.onEnd) settings.onEnd();
          return;
        }

        const item = parts[currentIndex];
        if (subIndex === 0) {
          currentSubChunks = splitTextForTTS(item.text, 140);
          if (settings?.onPartChange) {
            settings.onPartChange(item.part, item.text);
          }
        }

        if (subIndex >= currentSubChunks.length) {
          subIndex = 0;
          currentIndex++;
          if (currentIndex >= parts.length) {
            this.isSpeaking = false;
            this.currentAudioElement = null;
            if (settings?.onPartChange) settings.onPartChange('prompt', '');
            if (settings?.onEnd) settings.onEnd();
            return;
          }
          const pauseTime = item.part === 'question' ? 450 : 280;
          setTimeout(() => {
            if (this.currentSessionId === sessionId && this.isSpeaking) {
              playOnlinePart();
            }
          }, pauseTime);
          return;
        }

        const textToRead = currentSubChunks[subIndex];
        const url = getGoogleTTSUrl(textToRead);
        const audio = new Audio(url);
        this.currentAudioElement = audio;

        // Preload next audio chunk
        if (subIndex + 1 < currentSubChunks.length) {
          const nextAudio = new Audio(getGoogleTTSUrl(currentSubChunks[subIndex + 1]));
          nextAudio.preload = 'auto';
        } else if (currentIndex + 1 < parts.length) {
          const nextPartSub = splitTextForTTS(parts[currentIndex + 1].text, 140);
          if (nextPartSub.length > 0) {
            const nextAudio = new Audio(getGoogleTTSUrl(nextPartSub[0]));
            nextAudio.preload = 'auto';
          }
        }

        audio.onended = () => {
          if (this.currentSessionId !== sessionId || !this.isSpeaking) return;
          subIndex++;
          const innerPause = subIndex >= currentSubChunks.length ? (item.part === 'question' ? 450 : 280) : 120;
          if (subIndex >= currentSubChunks.length) {
            subIndex = 0;
            currentIndex++;
          }
          setTimeout(() => {
            if (this.currentSessionId === sessionId && this.isSpeaking) {
              playOnlinePart();
            }
          }, innerPause);
        };

        audio.onerror = () => {
          console.warn("Online speech part audio error");
          if (this.currentSessionId !== sessionId || !this.isSpeaking) return;
          this.isSpeaking = false;
          this.currentAudioElement = null;
          if (settings?.onEnd) settings.onEnd();
        };

        audio.play().catch((e) => {
          console.warn("Online audio part play error", e);
          if (this.currentSessionId !== sessionId || !this.isSpeaking) return;
          this.isSpeaking = false;
          this.currentAudioElement = null;
          if (settings?.onEnd) settings.onEnd();
        });
      };

      setTimeout(() => {
        if (this.currentSessionId === sessionId && this.isSpeaking) {
          playOnlinePart();
        }
      }, 80);
    }
  }

  /**
   * Speak a single option on demand (e.g. when teacher/host clicks mini-speaker on an option)
   * Always reads in Vietnamese, never in English.
   */
  public async speakSingleOption(optionKey: 'A' | 'B' | 'C' | 'D', text: string, onEnd?: () => void) {
    this.stop();
    if (this.isMuted) {
      if (onEnd) onEnd();
      return;
    }

    const spokenText = `Đáp án ${optionKey}: ${cleanSpeechText(text)}`;
    const viVoice = await ensureVietnameseVoiceLoaded();
    this.voice = viVoice;
    this.hasNativeViVoice = Boolean(viVoice);

    if (this.synth && this.ttsEngine !== 'online') {
      const utterance = new SpeechSynthesisUtterance(spokenText);
      utterance.lang = 'vi-VN';
      if (viVoice) {
        utterance.voice = viVoice;
      }
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      if (typeof window !== 'undefined') {
        (window as unknown as { __activeUtterance?: SpeechSynthesisUtterance }).__activeUtterance = utterance;
      }

      utterance.onend = () => {
        this.isSpeaking = false;
        if (onEnd) onEnd();
      };
      utterance.onerror = () => {
        this.isSpeaking = false;
        if (onEnd) onEnd();
      };

      this.isSpeaking = true;
      try {
        if (this.synth.paused) {
          this.synth.resume();
        }
        this.synth.speak(utterance);
      } catch (e) {
        console.warn("Speak single option error:", e);
        this.isSpeaking = false;
        if (onEnd) onEnd();
      }
    } else {
      try {
        const url = getGoogleTTSUrl(spokenText);
        const audio = new Audio(url);
        this.currentAudioElement = audio;
        this.isSpeaking = true;

        audio.onended = () => {
          this.isSpeaking = false;
          this.currentAudioElement = null;
          if (onEnd) onEnd();
        };
        audio.onerror = () => {
          this.isSpeaking = false;
          this.currentAudioElement = null;
          if (onEnd) onEnd();
        };
        audio.play().catch(() => {
          this.isSpeaking = false;
          this.currentAudioElement = null;
          if (onEnd) onEnd();
        });
      } catch {
        this.isSpeaking = false;
        if (onEnd) onEnd();
      }
    }
  }

  /**
   * Speak a single text phrase strictly in Vietnamese
   */
  public async speakSingleText(
    text: string,
    options?: { rate?: number; pitch?: number; volume?: number; onEnd?: () => void }
  ) {
    this.stop();
    if (this.isMuted) {
      if (options?.onEnd) options.onEnd();
      return;
    }

    const clean = cleanSpeechText(text);
    if (!clean) {
      if (options?.onEnd) options.onEnd();
      return;
    }

    const viVoice = await ensureVietnameseVoiceLoaded();
    this.voice = viVoice;
    this.hasNativeViVoice = Boolean(viVoice);

    if (this.synth && this.ttsEngine !== 'online') {
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.lang = 'vi-VN';
      if (viVoice) {
        utterance.voice = viVoice;
      }
      utterance.rate = options?.rate ?? 0.95;
      utterance.pitch = options?.pitch ?? 1.0;
      utterance.volume = options?.volume ?? 1.0;

      if (typeof window !== 'undefined') {
        (window as unknown as { __activeUtterance?: SpeechSynthesisUtterance }).__activeUtterance = utterance;
      }

      utterance.onend = () => {
        this.isSpeaking = false;
        if (options?.onEnd) options.onEnd();
      };
      utterance.onerror = () => {
        this.isSpeaking = false;
        if (options?.onEnd) options.onEnd();
      };

      this.isSpeaking = true;
      try {
        if (this.synth.paused) {
          this.synth.resume();
        }
        this.synth.speak(utterance);
      } catch {
        this.isSpeaking = false;
        if (options?.onEnd) options.onEnd();
      }
    } else {
      try {
        const url = getGoogleTTSUrl(clean);
        const audio = new Audio(url);
        this.currentAudioElement = audio;
        this.isSpeaking = true;

        audio.onended = () => {
          this.isSpeaking = false;
          this.currentAudioElement = null;
          if (options?.onEnd) options.onEnd();
        };
        audio.onerror = () => {
          this.isSpeaking = false;
          this.currentAudioElement = null;
          if (options?.onEnd) options.onEnd();
        };
        audio.play().catch(() => {
          this.isSpeaking = false;
          this.currentAudioElement = null;
          if (options?.onEnd) options.onEnd();
        });
      } catch {
        this.isSpeaking = false;
        if (options?.onEnd) options.onEnd();
      }
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
