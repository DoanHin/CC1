import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Users, Sparkles, Play } from 'lucide-react';

interface TeamSetupModalProps {
  defaultTeam1: string;
  defaultTeam2: string;
  onConfirm: (team1: string, team2: string, firstTeam: 1 | 2) => void;
}

export const TeamSetupModal: React.FC<TeamSetupModalProps> = ({
  defaultTeam1,
  defaultTeam2,
  onConfirm
}) => {
  const [team1Name, setTeam1Name] = useState(defaultTeam1);
  const [team2Name, setTeam2Name] = useState(defaultTeam2);
  const [firstTeam, setFirstTeam] = useState<1 | 2>(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const final1 = team1Name.trim() || 'Đội Xanh';
    const final2 = team2Name.trim() || 'Đội Đỏ';
    onConfirm(final1, final2, firstTeam);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="w-full max-w-xl bg-[#0c1427]/95 border-2 border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] text-slate-100 select-none"
      >
        <div className="text-center mb-6">
          <div className="inline-flex p-3 bg-cyan-950/80 rounded-2xl text-cyan-400 border border-cyan-500/40 mb-3 shadow-inner">
            <Users className="w-8 h-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
            THIẾT LẬP HAI ĐỘI THI ĐẤU
          </h2>
          <p className="text-sm sm:text-base text-slate-400 mt-1 font-medium">
            Nhập tên hai đội và lựa chọn đội mở câu hỏi đầu tiên
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Team 1 Input */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-blue-500/40">
            <label className="block text-xs font-black uppercase tracking-wider text-cyan-400 mb-1.5">
              ĐỘI 1 (Bên Trái - Áo Xanh)
            </label>
            <input
              type="text"
              value={team1Name}
              onChange={(e) => setTeam1Name(e.target.value)}
              placeholder="Nhập tên Đội 1 (Mặc định: Đội Xanh)"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold text-lg focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30 shadow-inner"
            />
          </div>

          {/* Team 2 Input */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-rose-500/40">
            <label className="block text-xs font-black uppercase tracking-wider text-rose-400 mb-1.5">
              ĐỘI 2 (Bên Phải - Áo Đỏ)
            </label>
            <input
              type="text"
              value={team2Name}
              onChange={(e) => setTeam2Name(e.target.value)}
              placeholder="Nhập tên Đội 2 (Mặc định: Đội Đỏ)"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold text-lg focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-500/30 shadow-inner"
            />
          </div>

          {/* First Team Selection */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-2.5">
              ĐỘI ĐƯỢC CHỌN CÂU HỎI ĐẦU TIÊN:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFirstTeam(1)}
                className={`py-2.5 px-4 rounded-xl font-black text-sm sm:text-base border transition cursor-pointer ${
                  firstTeam === 1
                    ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                    : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {team1Name.trim() || 'Đội Xanh'}
              </button>

              <button
                type="button"
                onClick={() => setFirstTeam(2)}
                className={`py-2.5 px-4 rounded-xl font-black text-sm sm:text-base border transition cursor-pointer ${
                  firstTeam === 2
                    ? 'bg-rose-500 text-slate-950 border-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                    : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {team2Name.trim() || 'Đội Đỏ'}
              </button>
            </div>
          </div>

          {/* Submit button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xl shadow-[0_0_30px_rgba(6,182,212,0.35)] flex items-center justify-center gap-2 border border-cyan-300 cursor-pointer transition-all"
          >
            <Play className="w-6 h-6 fill-current" />
            <span>VÀO TRẬN ĐẤU</span>
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};
