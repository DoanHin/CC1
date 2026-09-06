import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Volume2,
  VolumeX,
  Sparkles,
  ArrowRight,
  Bot,
  RotateCcw,
  BookOpen,
  FileAudio,
  Mic,
  LayoutGrid,
  Users,
  Trophy,
  ArrowLeft,
  Settings,
  CheckCircle2
} from 'lucide-react';
import { AZeroMascot } from './AZeroMascot';
import { speechService } from '../services/speechAndSound';

interface WelcomeScreenProps {
  greetingFullText: string;
  greetingAudioUrl?: string;
  azeroImageUrl?: string;
  isMuted: boolean;
  onToggleMute: () => void;
  onStartGame: () => void;
  onUpdateAudioUrl?: (url: string) => void;
  onUpdateAzeroImage?: (url: string) => void;
  onOpenSettings?: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  greetingFullText,
  greetingAudioUrl,
  azeroImageUrl,
  isMuted,
  onToggleMute,
  onStartGame,
  onUpdateAudioUrl,
  onOpenSettings
}) => {
  // Navigation state: 'home' (initial minimalist screen) or 'rules' (thể thức kéo co trí tuệ)
  const [currentView, setCurrentView] = useState<'home' | 'rules'>('home');
  const [voiceName, setVoiceName] = useState<string>('Adam (Trầm ấm)');

  // Audio Mode: 'custom' if greetingAudioUrl exists, otherwise 'tts'
  const [audioMode, setAudioMode] = useState<'tts' | 'custom'>(
    greetingAudioUrl && greetingAudioUrl.trim().length > 0 ? 'custom' : 'tts'
  );

  // Active speech and sync state for real-time text display
  const [isGreetingSpeaking, setIsGreetingSpeaking] = useState<boolean>(false);
  const [activeSpokenText, setActiveSpokenText] = useState<string>('');
  const [activeRuleCard, setActiveRuleCard] = useState<1 | 2 | 3 | null>(null);
  const [speechProgress, setSpeechProgress] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadToast, setUploadToast] = useState<string | null>(null);

  // Sync audio mode if prop changes
  useEffect(() => {
    if (greetingAudioUrl && greetingAudioUrl.trim().length > 0) {
      setAudioMode('custom');
    }
  }, [greetingAudioUrl]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      speechService.stop();
    };
  }, []);

  // Handle audio file upload
  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      if (dataUrl && onUpdateAudioUrl) {
        onUpdateAudioUrl(dataUrl);
        setAudioMode('custom');
        setUploadToast(`Đã nạp file: ${file.name}`);
        setTimeout(() => setUploadToast(null), 3500);
      }
    };
    reader.readAsDataURL(file);
  };

  // Toggle voice tone label for AI
  const handleToggleVoice = () => {
    if (audioMode === 'custom') {
      setAudioMode('tts');
      setUploadToast('Chuyển sang: Giọng AI AZero');
      setTimeout(() => setUploadToast(null), 2500);
    } else {
      const newVoice = voiceName.includes('Adam') ? 'Minh Trí (Tự nhiên)' : 'Adam (Trầm ấm)';
      setVoiceName(newVoice);
      setUploadToast(`Giọng đọc: ${newVoice}`);
      setTimeout(() => setUploadToast(null), 2500);
    }
  };

  // Click "GẶP GỠ AZERO" -> Start speech on home view; text appears in real time, then pop up rules when reached
  const handleMeetAZero = () => {
    setIsGreetingSpeaking(true);
    setActiveSpokenText('Xin chào quý thầy cô giáo cùng toàn thể các bạn học sinh Trường Trung học Phổ thông Tô Hiệu!');
    setActiveRuleCard(null);
    setSpeechProgress(0);

    const effectiveAudio = audioMode === 'custom' && greetingAudioUrl ? greetingAudioUrl : undefined;

    speechService.speakTextChunks(greetingFullText, {
      rate: 0.9,
      pitch: 1.05,
      audioUrl: effectiveAudio,
      onProgress: (info) => {
        if (info.chunk) {
          setActiveSpokenText(info.chunk);
        }
        setActiveRuleCard(info.activeRuleCard);
        setSpeechProgress(info.progress);

        // When audio reaches the rules part, auto pop up the rules board!
        if (info.isRulesPhase) {
          setCurrentView('rules');
        }
      },
      onChunkChange: (chunk) => {
        if (chunk) {
          setActiveSpokenText(chunk);
        }
      },
      onEnd: () => {
        setIsGreetingSpeaking(false);
        setActiveRuleCard(null);
        setCurrentView('rules');
      }
    });
  };

  // Replay speech in Rules view
  const handleReplayGreeting = () => {
    setIsGreetingSpeaking(true);
    setActiveRuleCard(null);
    const effectiveAudio = audioMode === 'custom' && greetingAudioUrl ? greetingAudioUrl : undefined;

    speechService.speakTextChunks(greetingFullText, {
      rate: 0.9,
      pitch: 1.05,
      audioUrl: effectiveAudio,
      onProgress: (info) => {
        if (info.chunk) {
          setActiveSpokenText(info.chunk);
        }
        setActiveRuleCard(info.activeRuleCard);
        setSpeechProgress(info.progress);
      },
      onChunkChange: (chunk) => {
        if (chunk) {
          setActiveSpokenText(chunk);
        }
      },
      onEnd: () => {
        setIsGreetingSpeaking(false);
        setActiveRuleCard(null);
      }
    });
  };

  // Proceed directly to the Tug of War match
  const handleProceedToMatch = () => {
    speechService.stop();
    setIsGreetingSpeaking(false);
    onStartGame();
  };

  return (
    <div className="relative w-full h-full min-h-screen flex flex-col justify-between p-3 sm:p-5 lg:p-6 bg-[#070b14] overflow-y-auto text-slate-100 select-none">
      {/* Background Cyber Ambient Radiance */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:28px_28px] opacity-25"></div>
      <div className="fixed -top-40 left-1/2 -translate-x-1/2 w-[850px] h-[550px] bg-cyan-500/10 rounded-full filter blur-[150px] pointer-events-none"></div>
      <div className="fixed -bottom-32 left-12 w-[400px] h-[400px] bg-blue-600/10 rounded-full filter blur-[130px] pointer-events-none"></div>
      <div className="fixed -bottom-32 right-12 w-[400px] h-[400px] bg-indigo-600/10 rounded-full filter blur-[130px] pointer-events-none"></div>

      {/* Hidden file input for audio */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleAudioUpload}
        accept="audio/*"
        className="hidden"
      />

      {/* Upload notification toast */}
      <AnimatePresence>
        {uploadToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-emerald-950/95 border border-emerald-500/50 text-emerald-300 font-bold text-xs rounded-full shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center gap-2 backdrop-blur-md"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{uploadToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOP BAR: Header exactly matching Image 1 */}
      <div className="relative z-20 flex items-center justify-between w-full shrink-0 mb-2 sm:mb-4">
        {/* Left: 11A0 – CLB ROBOTICS with glowing circular badge */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-slate-950 shadow-[0_0_22px_#00e5ff]">
            <Bot className="w-6 h-6 text-slate-950" />
          </div>
          <span className="text-sm sm:text-base font-black text-white tracking-wider uppercase drop-shadow-[0_0_10px_rgba(6,182,212,0.4)]">
            11A0 – CLB ROBOTICS
          </span>
        </div>

        {/* Right utility buttons matching Image 1 */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Button 1: File ghi âm */}
          <button
            onClick={() => fileInputRef.current?.click()}
            title={greetingAudioUrl ? "Đã nạp file ghi âm (Bấm để đổi file)" : "Tải file ghi âm AZero"}
            className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full border text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-sm ${
              audioMode === 'custom' && greetingAudioUrl
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/80'
                : 'bg-slate-900/90 hover:bg-slate-800 border-slate-700 text-slate-200 hover:text-white'
            }`}
          >
            <FileAudio className="w-3.5 h-3.5 text-cyan-400" />
            <span>File ghi âm</span>
            {audioMode === 'custom' && greetingAudioUrl && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            )}
          </button>

          {/* Button 2: Xem Luật chơi */}
          <button
            onClick={() => setCurrentView(currentView === 'rules' ? 'home' : 'rules')}
            className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full border text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-sm ${
              currentView === 'rules'
                ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'bg-slate-900/90 hover:bg-slate-800 border-slate-700 text-slate-200 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span>Xem Luật chơi</span>
          </button>

          {/* Button 3: Giọng đọc */}
          <button
            onClick={handleToggleVoice}
            title="Đổi giọng đọc AI / File"
            className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-sm"
          >
            <Mic className="w-3.5 h-3.5 text-cyan-400" />
            <span>Giọng {audioMode === 'custom' ? 'File thu âm' : voiceName}</span>
          </button>

          {/* Mute button */}
          <button
            onClick={onToggleMute}
            title={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
            className={`p-2 rounded-full border shadow-sm transition cursor-pointer ${
              isMuted
                ? 'bg-red-950/60 border-red-800 text-red-400'
                : 'bg-slate-900/90 hover:bg-slate-800 border-slate-700 text-slate-400 hover:text-cyan-300'
            }`}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

          {/* Admin Settings Shortcut */}
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              title="Cấu hình ngân hàng câu hỏi & âm thanh"
              className="p-2 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-cyan-300 shadow-sm transition cursor-pointer"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* VIEW 1: GIAO DIỆN ĐẦU TIÊN (PROJECTOR PRESENTATION VIEW - MATCHES IMAGE 1) */}
      {currentView === 'home' && (
        <div
          key="home-view"
          className="relative z-10 flex-1 flex flex-col items-center justify-center text-center my-auto py-2 max-w-4xl mx-auto w-full"
        >
          {/* Top Pill Badge: SÂN KHẤU ĐẤU TRÍ HỌC ĐƯỜNG */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 text-xs font-black tracking-widest uppercase mb-2 sm:mb-3 shadow-[0_0_20px_rgba(6,182,212,0.25)]">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>SÂN KHẤU ĐẤU TRÍ HỌC ĐƯỜNG</span>
          </div>

          {/* Main Title: KÉO CO TRÍ TUỆ */}
          <h1 className="text-4xl sm:text-6xl xl:text-7xl font-black text-white tracking-tight uppercase leading-none drop-shadow-[0_0_35px_rgba(6,182,212,0.6)]">
            KÉO CO <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-400 to-blue-400">TRÍ TUỆ</span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-slate-300 font-medium mt-2 max-w-lg">
            Cùng <span className="text-cyan-300 font-black">AZero</span> tranh tài kiến thức 16 câu hỏi
          </p>

          {/* Mascot Robot & Live Speech / Primary CTA */}
          <div className="relative my-2 sm:my-3 flex flex-col items-center justify-center w-full">
            <div className="relative w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center">
              {/* Concentric Ambient Glows */}
              <div className="absolute inset-0 rounded-full border border-cyan-500/25 animate-[spin_40s_linear_infinite] pointer-events-none"></div>
              <div className="absolute inset-3 rounded-full border border-dashed border-blue-400/20 pointer-events-none"></div>
              <div className="absolute inset-6 rounded-full bg-cyan-500/10 blur-xl pointer-events-none"></div>

              {/* Robot Mascot Vector */}
              <AZeroMascot
                size="large"
                isSpeaking={isGreetingSpeaking || speechService.isSpeaking}
                isPaused={speechService.isPaused}
                isMuted={isMuted}
                customImageUrl={azeroImageUrl}
                showSpeechBubble={false}
                showBadge={false}
              />
            </div>

            {/* Sub-badges below robot */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-1">
              <div className="px-3.5 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-[11px] font-bold text-slate-300 flex items-center gap-1.5 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                <span>AI AZero • 11A0 Robotics</span>
              </div>
              <div className="px-3.5 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-[11px] font-bold text-slate-400 flex items-center gap-1.5 shadow-sm">
                <Mic className="w-3 h-3 text-cyan-400" />
                <span>Giọng đọc: {audioMode === 'custom' && greetingAudioUrl ? 'File thu âm riêng' : voiceName}</span>
              </div>
            </div>
          </div>

          {/* DYNAMIC CONTENT: LIVE SPOKEN SUBTITLE BOX OR BIG CTA BUTTON */}
          {isGreetingSpeaking ? (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="w-full max-w-2xl mt-2 p-4 sm:p-5 rounded-3xl bg-[#0a1224]/95 border-2 border-cyan-400/60 shadow-[0_0_40px_rgba(6,182,212,0.35)] backdrop-blur-md flex flex-col items-center gap-3"
            >
              {/* Header with audio wave */}
              <div className="flex items-center justify-between w-full border-b border-cyan-500/20 pb-2">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
                  </span>
                  <span className="text-xs font-black text-cyan-300 uppercase tracking-widest">
                    AZero đang giới thiệu:
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <span className="w-1 h-3 bg-cyan-400 rounded-full animate-[bounce_0.8s_infinite]"></span>
                  <span className="w-1 h-5 bg-cyan-400 rounded-full animate-[bounce_0.6s_infinite_0.1s]"></span>
                  <span className="w-1 h-4 bg-cyan-400 rounded-full animate-[bounce_0.7s_infinite_0.2s]"></span>
                  <span className="w-1 h-6 bg-cyan-400 rounded-full animate-[bounce_0.5s_infinite_0.15s]"></span>
                  <span className="w-1 h-3 bg-cyan-400 rounded-full animate-[bounce_0.8s_infinite_0.3s]"></span>
                </div>
              </div>

              {/* Real-time Spoken Text Display: Nói đến đâu chữ hiện ra đến đó */}
              <AnimatePresence mode="wait">
                <motion.p
                  key={activeSpokenText}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="text-base sm:text-lg lg:text-xl font-black text-white leading-relaxed text-center drop-shadow-[0_0_12px_rgba(6,182,212,0.4)] min-h-[3.25rem] flex items-center justify-center px-2"
                >
                  "{activeSpokenText || 'Xin chào quý thầy cô và các bạn học sinh!'}"
                </motion.p>
              </AnimatePresence>

              {/* Audio progress bar */}
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.max(speechProgress * 100, 4)}%` }}
                />
              </div>

              {/* Sub-controls */}
              <div className="flex items-center justify-center gap-2.5 pt-1">
                <button
                  onClick={() => {
                    if (speechService.isPaused) {
                      speechService.resume();
                    } else {
                      speechService.pause();
                    }
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{speechService.isPaused ? '▶ Tiếp tục' : '⏸ Tạm dừng'}</span>
                </button>
                <button
                  onClick={() => {
                    speechService.stop();
                    setIsGreetingSpeaking(false);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-red-400 text-xs font-bold transition cursor-pointer"
                >
                  Dừng phát
                </button>
                <button
                  onClick={() => setCurrentView('rules')}
                  className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black transition flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.4)] cursor-pointer"
                >
                  <span>Xem luật chơi ngay</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="w-full max-w-sm sm:max-w-md flex flex-col items-center gap-3 mt-1">
              <motion.button
                id="btn-meet-azero-primary"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleMeetAZero}
                className="w-full py-3.5 sm:py-4 px-8 rounded-2xl bg-gradient-to-r from-[#00c6ff] via-[#0099ff] to-[#0072ff] hover:from-[#33d1ff] hover:to-[#1a85ff] text-white font-black text-lg sm:text-xl shadow-[0_0_35px_rgba(0,180,255,0.5)] border border-cyan-200/50 flex items-center justify-center gap-3 cursor-pointer transition"
              >
                <Volume2 className="w-5 h-5 sm:w-6 sm:h-6 text-white animate-pulse" />
                <span>GẶP GỠ AZERO</span>
                <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </motion.button>

              {/* Sub-actions underneath the big button */}
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setCurrentView('rules')}
                  className="px-3.5 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Xem trước luật chơi</span>
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                >
                  <FileAudio className="w-3.5 h-3.5 text-amber-400" />
                  <span>Nạp file ghi âm AZero</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: KHI ĐỌC ĐẾN LUẬT CHƠI / HIỆN THỂ LỆ (MATCHES IMAGE 2 EXACTLY) */}
      {currentView === 'rules' && (
        <div
          key="rules-view"
          className="relative z-10 flex-1 flex flex-col justify-center max-w-5xl mx-auto w-full my-auto py-2"
        >
          {/* Header Section matching Image 2 */}
          <div className="flex flex-col items-center text-center mb-3 sm:mb-4">
            {/* Mascot Avatar & Badges */}
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-[11px] font-bold text-slate-300 flex items-center gap-1.5 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                <span>AI AZero • 11A0 Robotics</span>
              </div>
              <div className="px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-[11px] font-bold text-slate-400 flex items-center gap-1.5 shadow-sm">
                <Mic className="w-3 h-3 text-cyan-400" />
                <span>Giọng đọc: {audioMode === 'custom' && greetingAudioUrl ? 'File thu âm riêng' : voiceName}</span>
              </div>
            </div>

            {/* Badge: LUẬT CHƠI CHÍNH THỨC */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 text-xs font-black tracking-wider uppercase mb-2 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>LUẬT CHƠI CHÍNH THỨC</span>
            </div>

            {/* Title: THỂ THỨC KÉO CO TRÍ TUỆ */}
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight uppercase drop-shadow-md">
              THỂ THỨC KÉO CO TRÍ TUỆ
            </h2>
          </div>

          {/* 3 Polished Glass Cards matching Image 2 with real-time audio highlight */}
          <div className="grid grid-cols-1 gap-3 sm:gap-4 max-w-4xl mx-auto w-full">
            {/* CARD 1: CHỌN Ô & TRẢ LỜI CÂU HỎI */}
            <div
              className={`p-4 sm:p-5 rounded-2xl backdrop-blur-md transition-all duration-300 shadow-xl flex items-start gap-3.5 sm:gap-4 ${
                activeRuleCard === 1
                  ? 'bg-cyan-950/80 border-2 border-cyan-400 shadow-[0_0_35px_rgba(6,182,212,0.4)] ring-2 ring-cyan-400/40'
                  : 'bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40'
              }`}
            >
              <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 shadow-inner ${
                activeRuleCard === 1 ? 'bg-cyan-500 text-slate-950 font-black' : 'bg-slate-950 border border-slate-800 text-cyan-400'
              }`}>
                {activeRuleCard === 1 ? <Volume2 className="w-6 h-6 animate-pulse" /> : <LayoutGrid className="w-5 h-5 sm:w-6 sm:h-6" />}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                  <h3 className="text-sm sm:text-base lg:text-lg font-black text-white tracking-tight">
                    1. CHỌN Ô & TRẢ LỜI CÂU HỎI
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-950 border border-cyan-500/40 text-cyan-300">
                    16 CÂU HỎI
                  </span>
                  {activeRuleCard === 1 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-cyan-400 text-slate-950 animate-pulse">
                      Đang đọc
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                  Trên màn hình có 16 ô câu hỏi và hai đội sẽ lần lượt lựa chọn một ô bất kỳ. Sau khi ô được mở, mình sẽ đọc câu hỏi cùng bốn phương án trả lời A, B, C và D.
                </p>

                <div className="mt-2 text-xs text-cyan-400 font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                  <span>Hai đội luân phiên mở ô • 4 đáp án A - B - C - D</span>
                </div>
              </div>
            </div>

            {/* CARD 2: THẢO LUẬN & KÉO DÂY */}
            <div
              className={`p-4 sm:p-5 rounded-2xl backdrop-blur-md transition-all duration-300 shadow-xl flex items-start gap-3.5 sm:gap-4 ${
                activeRuleCard === 2
                  ? 'bg-emerald-950/80 border-2 border-emerald-400 shadow-[0_0_35px_rgba(16,185,129,0.4)] ring-2 ring-emerald-400/40'
                  : 'bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40'
              }`}
            >
              <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 shadow-inner ${
                activeRuleCard === 2 ? 'bg-emerald-400 text-slate-950 font-black' : 'bg-slate-950 border border-slate-800 text-emerald-400'
              }`}>
                {activeRuleCard === 2 ? <Volume2 className="w-6 h-6 animate-pulse" /> : <Users className="w-5 h-5 sm:w-6 sm:h-6" />}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                  <h3 className="text-sm sm:text-base lg:text-lg font-black text-white tracking-tight">
                    2. THẢO LUẬN & KÉO DÂY
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-950 border border-emerald-500/40 text-emerald-300">
                    KÉO CO ĐỐI KHÁNG
                  </span>
                  {activeRuleCard === 2 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-400 text-slate-950 animate-pulse">
                      Đang đọc
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                  Mỗi đội hãy thảo luận, sau đó đưa ra đáp án cuối cùng của mình. Với mỗi câu trả lời đúng, đội chơi sẽ kéo được sợi dây về phía mình một bước. Nếu trả lời sai, sợi dây sẽ được giữ nguyên tại vị trí hiện tại.
                </p>

                <div className="mt-2 text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>Đúng: Kéo dây 1 bước về đội mình • Sai: Dây giữ nguyên</span>
                </div>
              </div>
            </div>

            {/* CARD 3: PHÂN ĐỊNH THẮNG BẠI & CÂU HỎI PHỤ */}
            <div
              className={`p-4 sm:p-5 rounded-2xl backdrop-blur-md transition-all duration-300 shadow-xl flex items-start gap-3.5 sm:gap-4 ${
                activeRuleCard === 3
                  ? 'bg-amber-950/80 border-2 border-amber-400 shadow-[0_0_35px_rgba(245,158,11,0.4)] ring-2 ring-amber-400/40'
                  : 'bg-slate-900/80 border border-slate-800 hover:border-amber-500/40'
              }`}
            >
              <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 shadow-inner ${
                activeRuleCard === 3 ? 'bg-amber-400 text-slate-950 font-black' : 'bg-slate-950 border border-slate-800 text-amber-400'
              }`}>
                {activeRuleCard === 3 ? <Volume2 className="w-6 h-6 animate-pulse" /> : <Trophy className="w-5 h-5 sm:w-6 sm:h-6" />}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                  <h3 className="text-sm sm:text-base lg:text-lg font-black text-white tracking-tight">
                    3. PHÂN ĐỊNH THẮNG BẠI & CÂU HỎI PHỤ
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-950 border border-amber-500/40 text-amber-300">
                    CHIẾN THẮNG CHUNG CUỘC
                  </span>
                  {activeRuleCard === 3 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-400 text-slate-950 animate-pulse">
                      Đang đọc
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                  Sau khi hoàn thành cả 16 câu hỏi, đội nào kéo được sợi dây về phía mình nhiều hơn sẽ giành chiến thắng. Trong trường hợp hai đội có kết quả bằng nhau, chúng ta sẽ bước vào câu hỏi phụ để tìm ra đội chiến thắng chung cuộc.
                </p>

                <div className="mt-2 text-xs text-amber-400 font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  <span>Đội nhiều điểm hơn chiến thắng • Bằng điểm vào câu hỏi phụ</span>
                </div>
              </div>
            </div>
          </div>

          {/* Real-time Ticker in Rules View if speaking */}
          {isGreetingSpeaking && activeSpokenText && (
            <div className="w-full max-w-4xl mx-auto mt-3 px-4 py-2.5 rounded-xl bg-slate-900/90 border border-cyan-500/40 text-center shadow-lg backdrop-blur-md">
              <div className="flex items-center justify-center gap-2 text-xs font-black text-cyan-300 uppercase tracking-wider mb-0.5">
                <Volume2 className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span>AZero đang đọc:</span>
              </div>
              <p className="text-sm sm:text-base font-bold text-white leading-relaxed">
                "{activeSpokenText}"
              </p>
            </div>
          )}

          {/* Action Bar for Entering Match / Replaying */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-5">
            <button
              onClick={() => setCurrentView('home')}
              className="py-2.5 px-4 sm:py-3 sm:px-5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer shadow-sm"
            >
              <ArrowLeft className="w-4 h-4 text-slate-400" />
              <span>Quay lại</span>
            </button>

            <button
              onClick={handleReplayGreeting}
              className="py-2.5 px-4 sm:py-3 sm:px-5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 font-bold text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer shadow-sm"
            >
              <RotateCcw className="w-4 h-4 text-cyan-400" />
              <span>Nghe lại luật chơi</span>
            </button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleProceedToMatch}
              className="py-2.5 px-6 sm:py-3 sm:px-8 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 hover:from-cyan-300 hover:via-blue-400 hover:to-indigo-500 text-white font-black text-sm sm:text-base shadow-[0_0_25px_rgba(6,182,212,0.4)] flex items-center gap-2 transition cursor-pointer border border-cyan-300/50"
            >
              <span>VÀO SÂN ĐẤU NGAY</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </motion.button>
          </div>
        </div>
      )}

      {/* FOOTER: Minimalist Bar */}
      <div className="relative z-20 flex items-center justify-between w-full pt-2 border-t border-slate-800/80 text-[11px] text-slate-500 font-semibold shrink-0 mt-2">
        <div className="flex items-center gap-2">
          <span>THPT Tô Hiệu • 11A0 Robotics</span>
          <span>•</span>
          <span>Sân khấu thi đấu Kéo co Trí tuệ</span>
        </div>

        <div className="flex items-center gap-2 text-cyan-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Hệ thống AZero kết nối</span>
        </div>
      </div>
    </div>
  );
};
