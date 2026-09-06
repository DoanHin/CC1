import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowRight,
  Sparkles,
  Music,
  Upload,
  Play,
  Pause,
  Bot,
  Volume2,
  Timer,
  Clock
} from 'lucide-react';
import { Question } from '../types';
import { speechService } from '../services/speechAndSound';
import confetti from 'canvas-confetti';

interface QuestionModalProps {
  question: Question;
  activeTeam: 1 | 2;
  team1Name: string;
  team2Name: string;
  onEvaluateResult: (isCorrect: boolean) => void;
  onCloseAndReturn: () => void;
  onUpdateQuestionAudio?: (questionId: number, audioUrl: string) => void;
  correctSoundUrl?: string;
  wrongSoundUrl?: string;
}

export const QuestionModal: React.FC<QuestionModalProps> = ({
  question,
  activeTeam,
  team1Name,
  team2Name,
  onEvaluateResult,
  onCloseAndReturn,
  onUpdateQuestionAudio,
  correctSoundUrl,
  wrongSoundUrl
}) => {
  const [evaluatedResult, setEvaluatedResult] = useState<'correct' | 'wrong' | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [currentReadingPart, setCurrentReadingPart] = useState<'intro' | 'question' | 'A' | 'B' | 'C' | 'D' | 'prompt' | null>(null);
  
  // 30-second countdown timer states (20s thinking + 10s answering)
  const TOTAL_TIME = 30;
  const THINKING_TIME = 20; // 30s down to 10s
  const ANSWERING_TIME = 10; // 10s down to 0s

  const [timeLeft, setTimeLeft] = useState<number>(TOTAL_TIME);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [timerStatus, setTimerStatus] = useState<'waiting_audio' | 'running' | 'paused' | 'time_up'>('waiting_audio');

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioInputRef = useRef<HTMLInputElement | null>(null);
  const currentTeamName = activeTeam === 1 ? team1Name : team2Name;

  // Countdown timer effect with 20s thinking + 10s answering transition
  useEffect(() => {
    if (isTimerRunning && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            setTimerStatus('time_up');
            speechService.playTimeUpSound();
            return 0;
          }
          // Chime alert when transitioning to the 10s answering phase (at exactly 10s left)
          if (prev === 11) {
            speechService.playAnswerPhaseAlert();
          }
          // Tick sound in the final 5 seconds
          if (prev - 1 <= 5) {
            speechService.playTimerTickSound();
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isTimerRunning, timeLeft]);

  // Start 30s countdown timer
  const startDiscussionTimer = () => {
    speechService.stop();
    speechService.playQuestionEndPip();
    setIsPlayingAudio(false);
    setCurrentReadingPart(null);
    setTimeLeft(TOTAL_TIME);
    setIsTimerRunning(true);
    setTimerStatus('running');
  };

  const handlePauseResumeTimer = () => {
    if (isTimerRunning) {
      setIsTimerRunning(false);
      setTimerStatus('paused');
    } else {
      if (timeLeft > 0) {
        setIsTimerRunning(true);
        setTimerStatus('running');
      } else {
        setTimeLeft(TOTAL_TIME);
        setIsTimerRunning(true);
        setTimerStatus('running');
      }
    }
  };

  const handleResetTimer = () => {
    setTimeLeft(TOTAL_TIME);
    setIsTimerRunning(true);
    setTimerStatus('running');
  };

  // Trigger speech on mount when question opens, ensuring reading question + 4 options then 30s countdown
  useEffect(() => {
    const startSpeechTimer = setTimeout(() => {
      readQuestionFull();
    }, 150);

    return () => {
      clearTimeout(startSpeechTimer);
      speechService.stop();
      setCurrentReadingPart(null);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [question.id]);

  const readQuestionFull = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsTimerRunning(false);
    setTimerStatus('waiting_audio');
    setTimeLeft(TOTAL_TIME);

    setIsPlayingAudio(true);
    setCurrentReadingPart('intro');

    // Unpause speech synthesis if suspended by browser
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.resume();
      } catch (e) {
        console.warn("speech resume err", e);
      }
    }

    speechService.speakQuestionAndOptions(
      question.id,
      question.question,
      question.options,
      currentTeamName,
      {
        audioUrl: question.audioUrl,
        rate: 1.08,
        pitch: 1.05,
        onPartChange: (part) => {
          setCurrentReadingPart(part);
        },
        onEnd: () => {
          setIsPlayingAudio(false);
          setCurrentReadingPart(null);
          // Automatically start 30s countdown (20s thinking + 10s answering) after reading completes!
          startDiscussionTimer();
        }
      }
    );
  };

  const handleTogglePlay = () => {
    if (speechService.isSpeaking) {
      speechService.stop();
      setIsPlayingAudio(false);
      setCurrentReadingPart(null);
      startDiscussionTimer();
    } else {
      readQuestionFull();
    }
  };

  const handleReadSingleOption = (e: React.MouseEvent, key: 'A' | 'B' | 'C' | 'D', text: string) => {
    e.stopPropagation();
    setCurrentReadingPart(key);
    setIsPlayingAudio(true);
    speechService.speakSingleOption(key, text);
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl && onUpdateQuestionAudio) {
        onUpdateQuestionAudio(question.id, dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCorrect = () => {
    if (evaluatedResult !== null) return;
    setEvaluatedResult('correct');
    speechService.stop();
    setIsPlayingAudio(false);
    setIsTimerRunning(false);
    if (timerRef.current) clearTimeout(timerRef.current);

    // Sound effect
    speechService.playCorrectSound(correctSoundUrl);

    // Confetti effect
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (e) {
      console.warn("Confetti error", e);
    }

    // AZero praise voice
    const praises = [
      `Chính xác! Xin chúc mừng đội ${currentTeamName}!`,
      `Hoàn toàn chính xác! Một bước kéo dành cho đội ${currentTeamName}!`,
      `Câu trả lời rất tuyệt vời! Đội ${currentTeamName} đã ghi thêm một điểm!`
    ];
    const praiseText = praises[Math.floor(Math.random() * praises.length)];

    setTimeout(() => {
      speechService.speakTextChunks(praiseText, { rate: 0.92, pitch: 1.08 });
    }, 450);

    onEvaluateResult(true);
  };

  const handleWrong = () => {
    if (evaluatedResult !== null) return;
    setEvaluatedResult('wrong');
    speechService.stop();
    setIsPlayingAudio(false);
    setIsTimerRunning(false);
    if (timerRef.current) clearTimeout(timerRef.current);

    // Sound effect
    speechService.playWrongSound(wrongSoundUrl);

    // AZero gentle encouragement voice
    const encouragements = [
      `Rất tiếc, đó chưa phải là đáp án chính xác!`,
      `Đáp án chưa chính xác, nhưng đội ${currentTeamName} đã rất cố gắng!`,
      `Chưa đúng rồi! Hãy tiếp tục cố gắng ở câu hỏi tiếp theo nhé!`
    ];
    const encText = encouragements[Math.floor(Math.random() * encouragements.length)];

    setTimeout(() => {
      speechService.speakTextChunks(encText, { rate: 0.9, pitch: 1.02 });
    }, 400);

    onEvaluateResult(false);
  };

  const optionKeys = ['A', 'B', 'C', 'D'] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md">
      {/* 3D Modern Dark High-Tech Container */}
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 8 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ type: "spring", damping: 24, stiffness: 160 }}
        className="relative w-full max-w-5xl max-h-[92vh] overflow-y-auto bg-[#0c1427]/98 border-2 border-cyan-500/50 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 md:p-6 shadow-[0_0_80px_rgba(0,0,0,0.85)] text-slate-100 select-none flex flex-col justify-between"
      >
        <div>
          {/* Top Header Badge & Question Audio Controls */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5 mb-2.5 sm:mb-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="px-3.5 py-1 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black text-sm sm:text-base md:text-lg tracking-wider shadow-sm">
                CÂU HỎI SỐ {question.id}
              </span>
              <div className={`px-3 py-1 rounded-xl text-xs sm:text-sm font-bold border ${
                activeTeam === 1
                  ? 'bg-blue-950/80 border-cyan-500/40 text-cyan-300'
                  : 'bg-rose-950/80 border-rose-500/40 text-rose-300'
              }`}>
                Lượt: <span className="font-black text-white">{currentTeamName}</span>
              </div>
            </div>

            {/* QUESTION AUDIO CONTROLS */}
            <div className="flex items-center gap-2">
              {/* Replay/Read button */}
              <button
                type="button"
                onClick={handleTogglePlay}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-black text-xs sm:text-sm shadow-xs transition cursor-pointer"
              >
                {isPlayingAudio ? (
                  <>
                    <Pause className="w-3.5 h-3.5 text-cyan-400" />
                    <span>DỪNG ĐỌC</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                    <span>ĐỌC LẠI</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Question Text with real-time reading highlight */}
          <div className={`mb-2.5 sm:mb-3 p-3.5 sm:p-4.5 md:p-5 rounded-xl sm:rounded-2xl transition-all duration-300 shadow-md ${
            currentReadingPart === 'question'
              ? 'bg-cyan-950/90 border-2 border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.4)] ring-2 ring-cyan-400/30'
              : 'bg-slate-900/95 border border-slate-700/80'
          }`}>
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-xs sm:text-sm font-black tracking-wider uppercase text-cyan-400 flex items-center gap-2">
                <span>NỘI DUNG CÂU HỎI</span>
                {currentReadingPart === 'question' && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-black uppercase bg-cyan-400 text-slate-950 animate-pulse">
                    Đang đọc...
                  </span>
                )}
              </span>
              {currentReadingPart === 'question' && (
                <Volume2 className="w-4 h-4 text-cyan-400 animate-pulse" />
              )}
            </div>
            <p className="text-xl sm:text-2xl md:text-3xl font-black leading-snug sm:leading-normal text-white tracking-wide">
              {question.question}
            </p>
          </div>

          {/* 30-SECOND DUAL-PHASE COUNTDOWN TIMER (20s Suy nghĩ + 10s Trả lời) */}
          {timerStatus === 'waiting_audio' && isPlayingAudio ? (
            <div className="mb-2.5 sm:mb-3 p-2.5 sm:p-3 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex flex-wrap items-center justify-between gap-2 shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shrink-0">
                  <Volume2 className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-black uppercase text-cyan-300 tracking-wide flex items-center gap-2">
                    <span>AZERO ĐANG ĐỌC CÂU HỎI & 4 ĐÁP ÁN</span>
                    <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  </div>
                  <div className="text-xs sm:text-sm text-slate-300">
                    Đồng hồ 30s (<span className="text-cyan-300 font-bold">20s suy nghĩ + 10s trả lời</span>) sẽ tự động đếm lùi sau khi đọc xong
                  </div>
                </div>
              </div>

              {/* Quick action to start 30s immediately */}
              <button
                type="button"
                onClick={startDiscussionTimer}
                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                title="Bỏ qua phần đọc và bắt đầu đếm lùi 30 giây ngay lập tức"
              >
                <Timer className="w-3.5 h-3.5" />
                <span>BẮT ĐẦU 30S NGAY</span>
              </button>
            </div>
          ) : (
            <div className={`mb-2.5 sm:mb-3 p-2.5 sm:p-3 rounded-xl border-2 transition-all duration-300 shadow-md ${
              timerStatus === 'time_up'
                ? 'bg-rose-950/90 border-rose-500 shadow-[0_0_25px_rgba(244,63,94,0.4)] ring-2 ring-rose-500/50'
                : timeLeft <= 10
                ? 'bg-amber-950/85 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.4)] ring-2 ring-amber-400/40'
                : 'bg-slate-900/95 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
            }`}>
              <div className="flex items-center justify-between gap-2.5 mb-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center font-black shadow-inner shrink-0 ${
                    timerStatus === 'time_up'
                      ? 'bg-rose-600 text-white animate-bounce shadow-md'
                      : timeLeft <= 10
                      ? 'bg-amber-400 text-slate-950 animate-pulse shadow-md'
                      : 'bg-gradient-to-br from-cyan-400 to-blue-500 text-slate-950'
                  }`}>
                    <Timer className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="truncate">
                    {/* Dual-Phase Badge: 20s Suy nghĩ / 10s Trả lời */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {timerStatus === 'time_up' ? (
                        <span className="px-2.5 py-0.5 rounded-md text-xs sm:text-sm font-black uppercase bg-rose-500 text-white animate-pulse">
                          🚨 HẾT GIỜ TRẢ LỜI!
                        </span>
                      ) : timeLeft > 10 ? (
                        <span className="px-2.5 py-0.5 rounded-md text-xs sm:text-sm font-black uppercase bg-cyan-900/90 text-cyan-200 border border-cyan-500/60 flex items-center gap-1.5">
                          <span>🧠 20S SUY NGHĨ:</span>
                          <span className="text-white font-black">{timeLeft - 10}s</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-md text-xs sm:text-sm font-black uppercase bg-amber-400 text-slate-950 animate-pulse flex items-center gap-1.5 font-mono">
                          <span>⚡ 10S TRẢ LỜI NGAY:</span>
                          <span className="text-rose-950 font-black">{timeLeft}s</span>
                        </span>
                      )}

                      {timerStatus === 'paused' && (
                        <span className="px-2 py-0.5 rounded text-[11px] font-black uppercase bg-amber-400 text-slate-950">
                          TẠM DỪNG
                        </span>
                      )}
                    </div>
                    <div className="text-xs sm:text-sm text-slate-300 mt-0.5 truncate">
                      Đội thi đấu: <span className="font-bold text-cyan-300">{currentTeamName}</span>
                    </div>
                  </div>
                </div>

                {/* Countdown Digital Display + Controls */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className={`text-xl sm:text-2xl md:text-3xl font-black font-mono tracking-tight px-3 py-0.5 rounded-lg shadow-inner border-2 flex items-center gap-1.5 ${
                    timerStatus === 'time_up'
                      ? 'bg-rose-900 text-rose-100 border-rose-400 animate-pulse'
                      : timeLeft <= 10
                      ? 'bg-amber-950 text-amber-300 border-amber-400 animate-pulse'
                      : 'bg-slate-950 text-cyan-400 border-cyan-500/40'
                  }`}>
                    <Clock className="w-4 h-4 opacity-70" />
                    <span>{timeLeft < 10 ? `0${timeLeft}` : timeLeft}s</span>
                  </div>

                  {/* Host Control: Pause / Resume */}
                  <button
                    type="button"
                    onClick={handlePauseResumeTimer}
                    title={isTimerRunning ? "Tạm dừng đồng hồ" : "Tiếp tục đếm lùi"}
                    className="p-1.5 sm:p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white transition cursor-pointer"
                  >
                    {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>

                  {/* Host Control: Reset to 30s */}
                  <button
                    type="button"
                    onClick={handleResetTimer}
                    title="Đặt lại 30 giây (20s suy nghĩ + 10s trả lời)"
                    className="p-1.5 sm:p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-cyan-300 transition cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Dual-Phase Progress Bar (Divided: 20s thinking [66.7%] + 10s answering [33.3%]) */}
              <div className="relative w-full h-2.5 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                {/* 10s marker line (marking where 20s thinking ends and 10s answering begins) */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-amber-400/80 z-10"
                  style={{ left: `${(10 / 30) * 100}%` }}
                  title="Vạch chuyển sang 10s trả lời"
                />
                <div
                  className={`h-full rounded-full transition-all duration-1000 ease-linear ${
                    timerStatus === 'time_up'
                      ? 'bg-rose-500'
                      : timeLeft <= 10
                      ? 'bg-gradient-to-r from-amber-400 via-rose-500 to-red-500'
                      : 'bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500'
                  }`}
                  style={{ width: `${(timeLeft / TOTAL_TIME) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* 4 Choices Grid (A, B, C, D) with High-Contrast Dark Modern Aesthetic */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 md:gap-3 mb-3">
            {optionKeys.map((key) => {
              const optionText = question.options[key];
              const isReadingThis = currentReadingPart === key;
              return (
                <div
                  key={key}
                  className={`group relative flex items-center justify-between gap-2.5 sm:gap-3 p-2.5 sm:p-3 md:p-3.5 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 shadow-sm ${
                    isReadingThis
                      ? 'bg-cyan-950/90 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)] ring-2 ring-cyan-400/40 text-white'
                      : 'bg-slate-900/90 border-slate-700/80 text-slate-100 hover:border-cyan-500/60 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
                    <div className={`w-9 h-9 sm:w-11 sm:h-11 shrink-0 rounded-lg sm:rounded-xl font-black text-base sm:text-xl flex items-center justify-center shadow-md transition-colors ${
                      isReadingThis
                        ? 'bg-cyan-400 text-slate-950'
                        : 'bg-gradient-to-br from-cyan-500 to-blue-600 text-slate-950'
                    }`}>
                      {key}
                    </div>
                    <span className={`text-base sm:text-lg md:text-xl font-bold leading-snug ${
                      isReadingThis ? 'text-white drop-shadow-[0_0_6px_rgba(6,182,212,0.6)] font-black' : 'text-slate-100'
                    }`}>
                      {optionText}
                    </span>
                  </div>

                  {/* Mini audio button to read this single option on demand */}
                  <button
                    type="button"
                    onClick={(e) => handleReadSingleOption(e, key, optionText)}
                    title={`Nghe lại đáp án ${key}`}
                    className={`p-2 rounded-lg border transition cursor-pointer shrink-0 ${
                      isReadingThis
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400 animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.5)]'
                        : 'bg-slate-950/60 hover:bg-slate-800 border-slate-800 text-slate-400 hover:text-cyan-300'
                    }`}
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* EVALUATION STATUS & BUTTONS (Always visible, compact, no scrolling needed) */}
        <div className="pt-2.5 border-t border-slate-800/80">
          {evaluatedResult === null ? (
            <div>
              <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto">
                {/* ĐÚNG button */}
                <motion.button
                  id="btn-eval-correct"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCorrect}
                  className="py-2.5 sm:py-3 px-5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-lg sm:text-xl md:text-2xl shadow-[0_0_20px_rgba(16,185,129,0.35)] flex items-center justify-center gap-2.5 border-2 border-emerald-300 cursor-pointer transition-all"
                >
                  <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-slate-950" />
                  <span>ĐÚNG ✓</span>
                </motion.button>

                {/* SAI button */}
                <motion.button
                  id="btn-eval-wrong"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleWrong}
                  className="py-2.5 sm:py-3 px-5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black text-lg sm:text-xl md:text-2xl shadow-[0_0_20px_rgba(244,63,94,0.35)] flex items-center justify-center gap-2.5 border-2 border-rose-400 cursor-pointer transition-all"
                >
                  <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  <span>SAI ✕</span>
                </motion.button>
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center py-2"
            >
              {evaluatedResult === 'correct' ? (
                <div className="flex items-center gap-2 text-emerald-400 text-2xl sm:text-3xl md:text-4xl font-black mb-2">
                  <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10" />
                  <span>CHÍNH XÁC! +1 BƯỚC KÉO</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-rose-400 text-2xl sm:text-3xl md:text-4xl font-black mb-2">
                  <XCircle className="w-8 h-8 sm:w-10 sm:h-10" />
                  <span>CHƯA CHÍNH XÁC! GIỮ NGUYÊN VỊ TRÍ</span>
                </div>
              )}

              {/* Explanatory note if available */}
              {question.explanation && (
                <div className="max-w-2xl text-center text-sm sm:text-base md:text-lg text-slate-200 bg-slate-900/90 p-3.5 rounded-xl mb-3 border border-slate-700 font-medium">
                  <span className="font-bold text-cyan-400">Thông tin thêm: </span>
                  {question.explanation}
                </div>
              )}

              {/* Button "TRỞ LẠI BẢNG CÂU HỎI" */}
              <motion.button
                id="btn-return-board"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onCloseAndReturn}
                className="py-3 px-8 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-lg sm:text-xl shadow-[0_0_25px_rgba(6,182,212,0.4)] flex items-center gap-2.5 border border-cyan-300 cursor-pointer transition-all"
              >
                <span>TRỞ LẠI BẢNG CÂU HỎI</span>
                <ArrowRight className="w-5 h-5 text-slate-950" />
              </motion.button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
