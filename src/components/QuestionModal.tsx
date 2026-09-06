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
  Volume2
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
  const audioInputRef = useRef<HTMLInputElement | null>(null);
  const currentTeamName = activeTeam === 1 ? team1Name : team2Name;

  // Trigger speech or custom question audio reading on mount
  useEffect(() => {
    readQuestionFull();
    return () => {
      speechService.stop();
      setCurrentReadingPart(null);
    };
  }, [question.id, question.audioUrl]);

  const readQuestionFull = () => {
    speechService.stop();
    setIsPlayingAudio(true);
    setCurrentReadingPart('intro');

    speechService.speakQuestionAndOptions(
      question.id,
      question.question,
      question.options,
      currentTeamName,
      {
        audioUrl: question.audioUrl,
        rate: 0.92,
        pitch: 1.05,
        onPartChange: (part) => {
          setCurrentReadingPart(part);
        },
        onEnd: () => {
          setIsPlayingAudio(false);
          setCurrentReadingPart(null);
        }
      }
    );
  };

  const handleTogglePlay = () => {
    if (speechService.isSpeaking) {
      speechService.stop();
      setIsPlayingAudio(false);
      setCurrentReadingPart(null);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      {/* 3D Modern Dark High-Tech Container */}
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0 }}
        transition={{ type: "spring", damping: 22, stiffness: 150 }}
        className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-[#0c1427]/95 border-2 border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] text-slate-100 select-none"
      >
        {/* Top Header Badge & Question Audio Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black text-base sm:text-lg tracking-wider shadow-md">
              CÂU HỎI SỐ {question.id}
            </span>
            <div className={`px-3.5 py-1 rounded-xl text-sm font-bold border ${
              activeTeam === 1
                ? 'bg-blue-950/80 border-cyan-500/40 text-cyan-300'
                : 'bg-rose-950/80 border-rose-500/40 text-rose-300'
            }`}>
              Lượt thi đấu: <span className="font-black text-white">{currentTeamName}</span>
            </div>
          </div>

          {/* QUESTION AUDIO CONTROLS (Chỗ nạp & điều khiển file đọc câu hỏi riêng) */}
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={audioInputRef}
              onChange={handleAudioUpload}
              accept="audio/*"
              className="hidden"
            />

            {/* Audio Source Status Badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300">
              {question.audioUrl && question.audioUrl.trim().length > 0 ? (
                <>
                  <Music className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">File đọc riêng</span>
                </>
              ) : (
                <>
                  <Bot className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-slate-400">Giọng đọc AI</span>
                </>
              )}
            </div>

            {/* Quick Upload Audio for Question */}
            <button
              onClick={() => audioInputRef.current?.click()}
              title="Tải file ghi âm riêng cho câu hỏi này"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-cyan-300 font-bold text-xs shadow-sm transition cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">File đọc câu hỏi</span>
            </button>

            {/* Replay/Read button */}
            <button
              onClick={handleTogglePlay}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-bold text-xs sm:text-sm shadow-sm transition cursor-pointer"
            >
              {isPlayingAudio ? (
                <>
                  <Pause className="w-4 h-4 text-cyan-400" />
                  <span>DỪNG ĐỌC</span>
                </>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4 text-cyan-400" />
                  <span>ĐỌC LẠI</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Question Text (Clear, Aesthetic, Clean) with real-time reading highlight */}
        <div className={`mb-5 p-4 sm:p-5 rounded-2xl transition-all duration-300 shadow-md ${
          currentReadingPart === 'question'
            ? 'bg-cyan-950/80 border-2 border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.35)] ring-2 ring-cyan-400/30'
            : 'bg-slate-900/90 border border-slate-700/80'
        }`}>
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-black tracking-wider uppercase text-cyan-400 flex items-center gap-1.5">
              <span>NỘI DUNG CÂU HỎI</span>
              {currentReadingPart === 'question' && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-cyan-400 text-slate-950 animate-pulse">
                  Đang đọc câu hỏi...
                </span>
              )}
            </span>
            {currentReadingPart === 'question' && (
              <Volume2 className="w-4 h-4 text-cyan-400 animate-pulse" />
            )}
          </div>
          <p className="text-xl sm:text-2xl md:text-3xl font-black leading-relaxed text-white">
            {question.question}
          </p>
        </div>

        {/* Prompt when reading finishes or transitions to options */}
        {currentReadingPart === 'prompt' && (
          <div className="mb-4 px-4 py-2 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-center text-sm font-black flex items-center justify-center gap-2 animate-pulse">
            <Volume2 className="w-4 h-4 text-cyan-400" />
            <span>Xin mời đội {currentTeamName} thảo luận và đưa ra đáp án!</span>
          </div>
        )}

        {/* 4 Choices Grid (A, B, C, D) with High-Contrast Dark Modern Aesthetic & Read Highlight */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-6">
          {optionKeys.map((key) => {
            const optionText = question.options[key];
            const isReadingThis = currentReadingPart === key;
            return (
              <div
                key={key}
                className={`group relative flex items-center justify-between gap-3 p-4 rounded-2xl transition-all duration-300 shadow-sm ${
                  isReadingThis
                    ? 'bg-cyan-950/90 border-2 border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.4)] ring-2 ring-cyan-400/40 text-white'
                    : 'bg-slate-900/80 border border-slate-700/80 text-slate-100 hover:border-cyan-500/50 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-3.5 flex-1">
                  <div className={`w-10 h-10 shrink-0 rounded-xl font-black text-xl flex items-center justify-center shadow-md transition-colors ${
                    isReadingThis
                      ? 'bg-cyan-400 text-slate-950'
                      : 'bg-gradient-to-br from-cyan-500 to-blue-600 text-slate-950'
                  }`}>
                    {key}
                  </div>
                  <span className={`text-base sm:text-lg font-bold leading-snug ${
                    isReadingThis ? 'text-white drop-shadow-[0_0_8px_rgba(6,182,212,0.5)] font-black' : 'text-slate-200'
                  }`}>
                    {optionText}
                  </span>
                </div>

                {/* Mini audio button to read this single option on demand */}
                <button
                  type="button"
                  onClick={(e) => handleReadSingleOption(e, key, optionText)}
                  title={`Nghe lại đáp án ${key}`}
                  className={`p-2 rounded-xl border transition cursor-pointer shrink-0 ${
                    isReadingThis
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 animate-pulse shadow-[0_0_10px_rgba(6,182,212,0.5)]'
                      : 'bg-slate-950/60 hover:bg-slate-800 border-slate-800 text-slate-400 hover:text-cyan-300'
                  }`}
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>

        {/* EVALUATION STATUS & BUTTONS */}
        <div className="pt-2 border-t border-slate-800">
          {evaluatedResult === null ? (
            <div>
              <div className="text-center text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
                BẢNG ĐIỀU KHIỂN KẾT QUẢ DÀNH CHO TRỌNG TÀI / MC
              </div>
              <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
                {/* ĐÚNG button */}
                <motion.button
                  id="btn-eval-correct"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleCorrect}
                  className="py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xl sm:text-2xl shadow-[0_0_25px_rgba(16,185,129,0.35)] flex items-center justify-center gap-3 border border-emerald-300 cursor-pointer transition-all"
                >
                  <CheckCircle2 className="w-7 h-7 text-slate-950" />
                  <span>ĐÚNG ✓</span>
                </motion.button>

                {/* SAI button */}
                <motion.button
                  id="btn-eval-wrong"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleWrong}
                  className="py-4 px-6 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black text-xl sm:text-2xl shadow-[0_0_25px_rgba(244,63,94,0.35)] flex items-center justify-center gap-3 border border-rose-400 cursor-pointer transition-all"
                >
                  <XCircle className="w-7 h-7 text-white" />
                  <span>SAI ✕</span>
                </motion.button>
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center py-3"
            >
              {evaluatedResult === 'correct' ? (
                <div className="flex items-center gap-3 text-emerald-400 text-2xl sm:text-3xl font-black mb-3">
                  <CheckCircle2 className="w-9 h-9" />
                  <span>CHÍNH XÁC! +1 BƯỚC KÉO</span>
                </div>
              ) : (
                <div className="flex items-center gap-3 text-rose-400 text-2xl sm:text-3xl font-black mb-3">
                  <XCircle className="w-9 h-9" />
                  <span>CHƯA CHÍNH XÁC! GIỮ NGUYÊN VỊ TRÍ</span>
                </div>
              )}

              {/* Explanatory note if available */}
              {question.explanation && (
                <div className="max-w-2xl text-center text-sm sm:text-base text-slate-300 bg-slate-900/90 p-3.5 rounded-xl mb-4 border border-slate-700 font-medium">
                  <span className="font-bold text-cyan-400">Thông tin thêm: </span>
                  {question.explanation}
                </div>
              )}

              {/* Button "TRỞ LẠI BẢNG CÂU HỎI" */}
              <motion.button
                id="btn-return-board"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={onCloseAndReturn}
                className="py-3 px-8 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-lg sm:text-xl shadow-[0_0_25px_rgba(6,182,212,0.4)] flex items-center gap-2 border border-cyan-300 cursor-pointer transition-all"
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
