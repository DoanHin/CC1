import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Users, Sparkles, Play, ArrowRight, ArrowLeft, CheckCircle2, Zap, Trophy } from 'lucide-react';

interface TeamSetupModalProps {
  defaultTeam1: string;
  defaultTeam2: string;
  questionCountMode: 10 | 16;
  onConfirm: (team1: string, team2: string, firstTeam: 1 | 2, mode: 10 | 16) => void;
}

export const TeamSetupModal: React.FC<TeamSetupModalProps> = ({
  defaultTeam1,
  defaultTeam2,
  questionCountMode,
  onConfirm
}) => {
  // Step state: 'teams' -> 'mode'
  const [step, setStep] = useState<'teams' | 'mode'>('teams');

  const [team1Name, setTeam1Name] = useState(defaultTeam1);
  const [team2Name, setTeam2Name] = useState(defaultTeam2);
  const [firstTeam, setFirstTeam] = useState<1 | 2>(1);
  const [selectedMode, setSelectedMode] = useState<10 | 16>(questionCountMode || 10);

  const handleGoToModeSelection = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('mode');
  };

  const handleFinalStart = () => {
    const final1 = team1Name.trim() || 'Đội Xanh';
    const final2 = team2Name.trim() || 'Đội Đỏ';
    onConfirm(final1, final2, firstTeam, selectedMode);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <motion.div
        key={step}
        initial={{ scale: 0.94, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-xl bg-[#0c1427]/95 border-2 border-cyan-500/40 rounded-3xl p-4 sm:p-6 shadow-[0_0_50px_rgba(0,0,0,0.8)] text-slate-100 select-none my-auto"
      >
        {/* Step Indicator Pills */}
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className={`px-3 py-1 rounded-full text-xs font-black flex items-center gap-1.5 transition ${
            step === 'teams'
              ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
              : 'bg-slate-900 border border-slate-700 text-slate-400'
          }`}>
            <span>1. TÊN HAI ĐỘI</span>
            {step === 'mode' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
          </div>
          <div className="w-4 h-0.5 bg-slate-700"></div>
          <div className={`px-3 py-1 rounded-full text-xs font-black flex items-center gap-1.5 transition ${
            step === 'mode'
              ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
              : 'bg-slate-900 border border-slate-700 text-slate-400'
          }`}>
            <span>2. CHỌN SỐ CÂU HỎI</span>
          </div>
        </div>

        {/* STEP 1: SETTING TEAM NAMES & WHO GOES FIRST (Ultra compact, 2 columns) */}
        {step === 'teams' && (
          <div>
            <div className="text-center mb-4">
              <div className="inline-flex p-2 bg-cyan-950/80 rounded-xl text-cyan-400 border border-cyan-500/40 mb-1.5 shadow-inner">
                <Users className="w-5 h-5" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase">
                THIẾT LẬP HAI ĐỘI THI ĐẤU
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 font-medium">
                Nhập tên hai đội và chỉ định đội mở ô câu hỏi đầu tiên
              </p>
            </div>

            <form onSubmit={handleGoToModeSelection} className="space-y-3.5">
              {/* Team 1 & Team 2 in 2 Columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Team 1 Input */}
                <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-900/90 border border-blue-500/40 shadow-sm">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      <span>ĐỘI 1 (Áo Xanh)</span>
                    </label>
                  </div>
                  <input
                    type="text"
                    value={team1Name}
                    onChange={(e) => setTeam1Name(e.target.value)}
                    placeholder="Đội Xanh"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold text-sm sm:text-base focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30 shadow-inner"
                  />
                </div>

                {/* Team 2 Input */}
                <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-900/90 border border-rose-500/40 shadow-sm">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-black uppercase tracking-wider text-rose-400 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                      <span>ĐỘI 2 (Áo Đỏ)</span>
                    </label>
                  </div>
                  <input
                    type="text"
                    value={team2Name}
                    onChange={(e) => setTeam2Name(e.target.value)}
                    placeholder="Đội Đỏ"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold text-sm sm:text-base focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-500/30 shadow-inner"
                  />
                </div>
              </div>

              {/* First Team Selection */}
              <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-300 mb-2 text-center">
                  ĐỘI ĐƯỢC CHỌN CÂU HỎI ĐẦU TIÊN:
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setFirstTeam(1)}
                    className={`py-2 px-3 rounded-xl font-black text-xs sm:text-sm border transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      firstTeam === 1
                        ? 'bg-blue-600 text-white border-blue-300 shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                        : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>🔵</span>
                    <span className="truncate">{team1Name.trim() || 'Đội Xanh'}</span>
                    {firstTeam === 1 && <span className="text-[10px] bg-white/20 px-1 py-0.2 rounded font-bold">Đi trước</span>}
                  </button>

                  <button
                    type="button"
                    onClick={() => setFirstTeam(2)}
                    className={`py-2 px-3 rounded-xl font-black text-xs sm:text-sm border transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      firstTeam === 2
                        ? 'bg-rose-600 text-white border-rose-300 shadow-[0_0_15px_rgba(225,29,72,0.4)]'
                        : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>🔴</span>
                    <span className="truncate">{team2Name.trim() || 'Đội Đỏ'}</span>
                    {firstTeam === 2 && <span className="text-[10px] bg-white/20 px-1 py-0.2 rounded font-bold">Đi trước</span>}
                  </button>
                </div>
              </div>

              {/* Next Button */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                className="w-full py-3 sm:py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-base sm:text-lg shadow-[0_0_25px_rgba(6,182,212,0.35)] flex items-center justify-center gap-2 border border-cyan-300 cursor-pointer transition-all"
              >
                <span>TIẾP THEO: CHỌN PHIÊN BẢN CÂU HỎI</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </form>
          </div>
        )}

        {/* STEP 2: SELECT 10 QUESTIONS VS 16 QUESTIONS (Minimal text as requested) */}
        {step === 'mode' && (
          <div>
            <div className="text-center mb-4">
              <div className="inline-flex p-2 bg-amber-950/80 rounded-xl text-amber-400 border border-amber-500/40 mb-1.5 shadow-inner">
                <Trophy className="w-5 h-5" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase">
                CHỌN PHIÊN BẢN
              </h2>
            </div>

            {/* 2 Clean Mode Option Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-4">
              {/* Mode 1: 10 Questions */}
              <button
                type="button"
                onClick={() => setSelectedMode(10)}
                className={`py-5 px-4 rounded-2xl border text-center transition-all cursor-pointer relative flex flex-col items-center justify-center gap-2 ${
                  selectedMode === 10
                    ? 'bg-gradient-to-br from-cyan-950/90 to-blue-950/90 border-2 border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.4)] ring-2 ring-cyan-400/40'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 opacity-80 hover:opacity-100'
                }`}
              >
                {selectedMode === 10 && (
                  <div className="absolute top-3 right-3 text-cyan-400">
                    <CheckCircle2 className="w-5 h-5 fill-cyan-400 text-slate-950" />
                  </div>
                )}
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-400/30">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-base sm:text-lg font-black text-white">
                  Phiên bản 10 câu
                </h3>
              </button>

              {/* Mode 2: 16 Questions */}
              <button
                type="button"
                onClick={() => setSelectedMode(16)}
                className={`py-5 px-4 rounded-2xl border text-center transition-all cursor-pointer relative flex flex-col items-center justify-center gap-2 ${
                  selectedMode === 16
                    ? 'bg-gradient-to-br from-blue-950/90 to-indigo-950/90 border-2 border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.4)] ring-2 ring-cyan-400/40'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 opacity-80 hover:opacity-100'
                }`}
              >
                {selectedMode === 16 && (
                  <div className="absolute top-3 right-3 text-cyan-400">
                    <CheckCircle2 className="w-5 h-5 fill-cyan-400 text-slate-950" />
                  </div>
                )}
                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-400/30">
                  <Trophy className="w-6 h-6" />
                </div>
                <h3 className="text-base sm:text-lg font-black text-white">
                  Phiên bản 16 câu
                </h3>
              </button>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStep('teams')}
                className="py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Quay lại</span>
              </button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handleFinalStart}
                className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-base sm:text-lg shadow-[0_0_25px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2 border border-emerald-300 cursor-pointer transition-all uppercase tracking-wider"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>BẮT ĐẦU ({selectedMode} CÂU)</span>
              </motion.button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
