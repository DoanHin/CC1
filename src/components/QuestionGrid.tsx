import React from 'react';
import { motion } from 'motion/react';
import { Check, Lock } from 'lucide-react';

interface QuestionGridProps {
  openedQuestions: number[];
  onSelectQuestion: (questionId: number) => void;
  activeTeam: 1 | 2;
  team1Name: string;
  team2Name: string;
}

export const QuestionGrid: React.FC<QuestionGridProps> = ({
  openedQuestions,
  onSelectQuestion,
  activeTeam,
  team1Name,
  team2Name,
}) => {
  const totalQuestions = 16;
  const questionsList = Array.from({ length: totalQuestions }, (_, i) => i + 1);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-1 select-none">
      {/* Turn instruction banner */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase tracking-wider text-cyan-400">
            BẢNG 16 CÂU HỎI
          </span>
          <span className="text-xs font-bold text-slate-400">
            (Đã mở: {openedQuestions.length}/{totalQuestions})
          </span>
        </div>
        <div className={`px-3.5 py-1 rounded-full text-xs font-black shadow-md uppercase tracking-wider ${
          activeTeam === 1
            ? 'bg-cyan-500 text-slate-950 ring-2 ring-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
            : 'bg-rose-500 text-slate-950 ring-2 ring-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.4)]'
        }`}>
          Lượt chọn: {activeTeam === 1 ? team1Name : team2Name}
        </div>
      </div>

      {/* 4x4 Grid (4 rows x 4 columns) */}
      <div className="grid grid-cols-4 gap-2.5 max-w-xl mx-auto">
        {questionsList.map((num) => {
          const isOpened = openedQuestions.includes(num);

          return (
            <motion.button
              key={num}
              id={`question-card-${num}`}
              disabled={isOpened}
              whileHover={!isOpened ? { scale: 1.05, y: -2 } : {}}
              whileTap={!isOpened ? { scale: 0.95 } : {}}
              onClick={() => onSelectQuestion(num)}
              className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center font-black transition-all duration-200 ${
                isOpened
                  ? 'bg-slate-950/70 text-slate-600 border border-slate-800/80 cursor-not-allowed shadow-inner'
                  : activeTeam === 1
                  ? 'bg-slate-900/90 border-2 border-cyan-500/50 text-cyan-300 hover:bg-cyan-500 hover:text-slate-950 hover:border-cyan-300 hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] shadow-md cursor-pointer'
                  : 'bg-slate-900/90 border-2 border-rose-500/50 text-rose-300 hover:bg-rose-500 hover:text-slate-950 hover:border-rose-300 hover:shadow-[0_0_20px_rgba(244,63,94,0.5)] shadow-md cursor-pointer'
              }`}
            >
              {isOpened ? (
                <div className="flex flex-col items-center">
                  <span className="text-sm font-bold text-slate-600 line-through">{num}</span>
                  <Check className="w-4 h-4 text-slate-600 mt-0.5" />
                </div>
              ) : (
                <span className="text-xl sm:text-2xl font-black tracking-tight">
                  {num < 10 ? `0${num}` : num}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
