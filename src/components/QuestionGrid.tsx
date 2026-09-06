import React from 'react';
import { motion } from 'motion/react';
import { Check, Lock } from 'lucide-react';

interface QuestionGridProps {
  openedQuestions: number[];
  onSelectQuestion: (questionId: number) => void;
  activeTeam: 1 | 2;
  team1Name: string;
  team2Name: string;
  maxQuestions?: 10 | 16;
}

export const QuestionGrid: React.FC<QuestionGridProps> = ({
  openedQuestions,
  onSelectQuestion,
  activeTeam,
  team1Name,
  team2Name,
  maxQuestions = 16,
}) => {
  const totalQuestions = maxQuestions;
  const questionsList = Array.from({ length: totalQuestions }, (_, i) => i + 1);

  return (
    <div className="w-full max-w-5xl mx-auto px-2 select-none flex flex-col justify-center h-full">
      {/* Turn instruction banner */}
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-sm sm:text-base font-black uppercase tracking-wider text-slate-800">
            BẢNG {totalQuestions} CÂU HỎI
          </span>
          <span className="text-xs sm:text-sm font-semibold text-slate-500">
            (Đã mở: {openedQuestions.length}/{totalQuestions})
          </span>
          <span className="px-2.5 py-0.5 text-xs font-black rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            Chế độ: {totalQuestions} câu
          </span>
        </div>
        <div className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-black shadow-sm uppercase tracking-wider ${
          activeTeam === 1
            ? 'bg-blue-600 text-white ring-2 ring-blue-200 shadow-blue-200'
            : 'bg-rose-600 text-white ring-2 ring-rose-200 shadow-rose-200'
        }`}>
          Lượt chọn: {activeTeam === 1 ? team1Name : team2Name}
        </div>
      </div>

      {/* Grid: 5 columns x 2 rows for 10-question mode, or 4 columns x 4 rows for 16-question mode */}
      <div className={`grid mx-auto w-full ${
        totalQuestions === 10
          ? 'grid-cols-5 gap-3 sm:gap-4 md:gap-5 max-w-5xl'
          : 'grid-cols-4 gap-2.5 sm:gap-3 md:gap-4 max-w-4xl'
      }`}>
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
              className={`relative ${
                totalQuestions === 10
                  ? 'h-20 sm:h-24 md:h-28 lg:h-32'
                  : 'h-12 sm:h-14 md:h-18 lg:h-20'
              } w-full rounded-2xl flex flex-col items-center justify-center font-black transition-all duration-200 shadow-sm ${
                isOpened
                  ? 'bg-slate-100 text-slate-400 border-2 border-slate-200 cursor-not-allowed shadow-inner'
                  : activeTeam === 1
                  ? 'bg-gradient-to-b from-white to-blue-50/70 border-2 sm:border-3 border-blue-500 text-blue-700 hover:bg-blue-600 hover:text-white hover:border-blue-600 hover:shadow-lg shadow-blue-100/50 cursor-pointer'
                  : 'bg-gradient-to-b from-white to-rose-50/70 border-2 sm:border-3 border-rose-500 text-rose-700 hover:bg-rose-600 hover:text-white hover:border-rose-600 hover:shadow-lg shadow-rose-100/50 cursor-pointer'
              }`}
            >
              {isOpened ? (
                <div className="flex items-center gap-2">
                  <span className="text-lg sm:text-2xl font-bold text-slate-400 line-through">{num}</span>
                  <Check className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400 stroke-[3]" />
                </div>
              ) : (
                <span className={`${
                  totalQuestions === 10
                    ? 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl'
                    : 'text-xl sm:text-2xl md:text-3xl lg:text-4xl'
                } font-black tracking-tight`}>
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
