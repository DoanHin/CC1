import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, XCircle, RotateCcw, Zap, Music, Bot, Volume2 } from 'lucide-react';
import { Question } from '../types';
import { speechService } from '../services/speechAndSound';

interface TieBreakerModalProps {
  question: Question;
  team1Name: string;
  team2Name: string;
  onWin: (winningTeam: 1 | 2) => void;
  onCancel: () => void;
  correctSoundUrl?: string;
  wrongSoundUrl?: string;
}

export const TieBreakerModal: React.FC<TieBreakerModalProps> = ({
  question,
  team1Name,
  team2Name,
  onWin,
  onCancel,
  correctSoundUrl,
  wrongSoundUrl
}) => {
  const [selectedTeam, setSelectedTeam] = useState<1 | 2 | null>(null);
  const [currentReadingPart, setCurrentReadingPart] = useState<'intro' | 'question' | 'A' | 'B' | 'C' | 'D' | 'prompt' | null>(null);

  useEffect(() => {
    readQuestion();
    return () => {
      speechService.stop();
      setCurrentReadingPart(null);
    };
  }, []);

  const readQuestion = () => {
    speechService.stop();
    setCurrentReadingPart('intro');

    speechService.speakQuestionAndOptions(
      question.id,
      question.question,
      question.options,
      "đang có quyền",
      {
        audioUrl: question.audioUrl,
        rate: 0.92,
        pitch: 1.05,
        onPartChange: (part) => {
          setCurrentReadingPart(part);
        },
        onEnd: () => {
          setCurrentReadingPart(null);
        }
      }
    );
  };

  const handleReadSingleOption = (e: React.MouseEvent, key: 'A' | 'B' | 'C' | 'D', text: string) => {
    e.stopPropagation();
    setCurrentReadingPart(key);
    speechService.speakSingleOption(key, text);
  };

  const handleCorrect = () => {
    if (!selectedTeam) return;
    speechService.playCorrectSound(correctSoundUrl);
    onWin(selectedTeam);
  };

  const handleWrong = () => {
    if (!selectedTeam) return;
    speechService.playWrongSound(wrongSoundUrl);
    const failedTeamName = selectedTeam === 1 ? team1Name : team2Name;
    const remainingTeamName = selectedTeam === 1 ? team2Name : team1Name;
    speechService.speakTextChunks(
      `Đội ${failedTeamName} trả lời chưa chính xác. Quyền trả lời được chuyển sang cho đội ${remainingTeamName}!`,
      { rate: 0.9, pitch: 1.02 }
    );
    setSelectedTeam(selectedTeam === 1 ? 2 : 1);
  };

  const optionKeys = ['A', 'B', 'C', 'D'] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-4xl bg-[#0c1427]/95 border-2 border-amber-500/50 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] text-slate-100 select-none"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-base sm:text-lg flex items-center gap-2 shadow-md">
              <Zap className="w-5 h-5 fill-current" />
              CÂU HỎI PHỤ QUYẾT ĐỊNH
            </span>
          </div>

          <div className="flex items-center gap-2">
            {question.audioUrl && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-emerald-400">
                <Music className="w-3.5 h-3.5" />
                File đọc riêng
              </span>
            )}

            <button
              onClick={readQuestion}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white font-bold text-sm shadow-sm transition cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-amber-400" />
              <span>ĐỌC LẠI CÂU HỎI</span>
            </button>
          </div>
        </div>

        {/* Question Text */}
        <div className={`mb-5 p-4 rounded-2xl transition-all duration-300 shadow-md ${
          currentReadingPart === 'question'
            ? 'bg-amber-950/80 border-2 border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.35)] ring-2 ring-amber-400/30'
            : 'bg-slate-900/90 border border-slate-700'
        }`}>
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-black tracking-wider uppercase text-amber-400 flex items-center gap-1.5">
              <span>CÂU HỎI PHỤ</span>
              {currentReadingPart === 'question' && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-400 text-slate-950 animate-pulse">
                  Đang đọc câu hỏi...
                </span>
              )}
            </span>
            {currentReadingPart === 'question' && (
              <Volume2 className="w-4 h-4 text-amber-400 animate-pulse" />
            )}
          </div>
          <p className="text-xl sm:text-2xl font-black leading-relaxed text-amber-300">
            {question.question}
          </p>
        </div>

        {/* 4 Choices */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-6">
          {optionKeys.map((key) => {
            const isReadingThis = currentReadingPart === key;
            const optionText = question.options[key];
            return (
              <div
                key={key}
                className={`group relative flex items-center justify-between gap-3 p-3.5 rounded-2xl transition-all duration-300 shadow-sm ${
                  isReadingThis
                    ? 'bg-amber-950/90 border-2 border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.4)] ring-2 ring-amber-400/40 text-white'
                    : 'bg-slate-900/80 border border-slate-700/80 text-slate-100 hover:border-amber-500/50 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-3.5 flex-1">
                  <div className={`w-10 h-10 shrink-0 rounded-xl font-black text-xl flex items-center justify-center shadow-md transition-colors ${
                    isReadingThis
                      ? 'bg-amber-400 text-slate-950'
                      : 'bg-gradient-to-br from-amber-500 to-orange-500 text-slate-950'
                  }`}>
                    {key}
                  </div>
                  <span className={`text-base sm:text-lg font-bold leading-snug ${
                    isReadingThis ? 'text-white drop-shadow-[0_0_8px_rgba(245,158,11,0.5)] font-black' : 'text-slate-200'
                  }`}>
                    {optionText}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={(e) => handleReadSingleOption(e, key, optionText)}
                  title={`Nghe lại đáp án ${key}`}
                  className={`p-2 rounded-xl border transition cursor-pointer shrink-0 ${
                    isReadingThis
                      ? 'bg-amber-500 text-slate-950 border-amber-400 animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                      : 'bg-slate-950/60 hover:bg-slate-800 border-slate-800 text-slate-400 hover:text-amber-300'
                  }`}
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Select which team has the right to answer */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 mb-6">
          <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2.5 text-center">
            BƯỚC 1: CHỌN ĐỘI GIÀNH ĐƯỢC QUYỀN TRẢ LỜI (NHẤN CHUÔNG NHANH)
          </label>
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
            <button
              onClick={() => setSelectedTeam(1)}
              className={`py-3 px-4 rounded-2xl font-black text-base border transition cursor-pointer ${
                selectedTeam === 1
                  ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {team1Name}
            </button>
            <button
              onClick={() => setSelectedTeam(2)}
              className={`py-3 px-4 rounded-2xl font-black text-base border transition cursor-pointer ${
                selectedTeam === 2
                  ? 'bg-rose-500 text-slate-950 border-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {team2Name}
            </button>
          </div>
        </div>

        {/* Step 2: Evaluate result */}
        {selectedTeam && (
          <div className="text-center pt-2">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
              BƯỚC 2: ĐÁNH GIÁ CÂU TRẢ LỜI CỦA {selectedTeam === 1 ? team1Name : team2Name}
            </p>
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              <button
                onClick={handleCorrect}
                className="py-3 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xl flex items-center justify-center gap-2 border border-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.35)] cursor-pointer transition-all"
              >
                <CheckCircle2 className="w-6 h-6 text-slate-950" />
                <span>ĐÚNG ✓ (THẮNG)</span>
              </button>
              <button
                onClick={handleWrong}
                className="py-3 px-6 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black text-xl flex items-center justify-center gap-2 border border-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.35)] cursor-pointer transition-all"
              >
                <XCircle className="w-6 h-6 text-white" />
                <span>SAI ✕ (CHUYỂN)</span>
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
