import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Trophy, Sparkles, RotateCcw, Award } from 'lucide-react';
import { speechService } from '../services/speechAndSound';
import { AZeroMascot } from './AZeroMascot';
import confetti from 'canvas-confetti';

interface VictoryScreenProps {
  team1Name: string;
  team2Name: string;
  team1Score: number;
  team2Score: number;
  winnerTeam: 1 | 2;
  onRestartGame: () => void;
  victorySoundUrl?: string;
  azeroImageUrl?: string;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const VictoryScreen: React.FC<VictoryScreenProps> = ({
  team1Name,
  team2Name,
  team1Score,
  team2Score,
  winnerTeam,
  onRestartGame,
  victorySoundUrl,
  azeroImageUrl,
  isMuted,
  onToggleMute
}) => {
  const [currentChunk, setCurrentChunk] = useState<string>('');
  const [speechFinished, setSpeechFinished] = useState<boolean>(false);

  const winningName = winnerTeam === 1 ? team1Name : team2Name;
  const winningScore = winnerTeam === 1 ? team1Score : team2Score;
  const runnerUpName = winnerTeam === 1 ? team2Name : team1Name;
  const runnerUpScore = winnerTeam === 1 ? team2Score : team1Score;

  useEffect(() => {
    // 1. Play victory fanfare sound
    speechService.playVictoryFanfare(victorySoundUrl);

    // 2. Launch celebratory confetti barrage
    const duration = 4.5 * 1000;
    const animationEnd = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 }
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 }
      });
      if (Date.now() < animationEnd) {
        requestAnimationFrame(frame);
      }
    };
    frame();

    // 3. AZero victory speech sequence
    const victorySpeechChunks = [
      "Trò chơi Kéo co trí tuệ đã chính thức khép lại!",
      `Với ${winningScore} câu trả lời chính xác, xin chúc mừng đội ${winningName} đã xuất sắc giành chiến thắng ngày hôm nay!`,
      "Một tràng pháo tay thật lớn dành cho đội chiến thắng!",
      "Cảm ơn cả hai đội đã tham gia trò chơi hết sức nhiệt tình và mang đến những màn tranh tài vô cùng hấp dẫn.",
      "AZero xin cảm ơn quý thầy cô giáo cùng toàn thể các bạn học sinh đã theo dõi và cổ vũ.",
      "Và bây giờ, AZero xin được nhường lại sân khấu cho hai bạn MC.",
      "Xin trân trọng cảm ơn!"
    ];

    setTimeout(() => {
      speechService.speakTextChunks(victorySpeechChunks, {
        rate: 0.9,
        pitch: 1.05,
        onChunkChange: (chunk) => setCurrentChunk(chunk),
        onEnd: () => setSpeechFinished(true)
      });
    }, 1200);

    return () => {
      speechService.stop();
    };
  }, []);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between p-6 bg-gradient-to-b from-sky-100 via-blue-50 to-amber-50 overflow-hidden text-slate-800 select-none">
      {/* Visual Ambient Dot Grid & Geometric Accents */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-dot-grid"></div>
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-amber-200/30 rounded-full filter blur-[100px]"></div>

      {/* TOP: Winner Announcement Banner */}
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10 text-center mt-2"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 border border-amber-300 text-amber-800 font-extrabold text-sm mb-2 shadow-sm">
          <Trophy className="w-4 h-4 text-amber-600" />
          KẾT QUẢ CHUNG CUỘC
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-blue-950 tracking-tight uppercase leading-tight">
          CHÚC MỪNG <span className="text-amber-500">CHIẾN THẮNG!</span>
        </h1>
      </motion.div>

      {/* CENTER: Winner Trophy & Visual Arena Showcase */}
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-center gap-8 w-full max-w-5xl my-auto">
        {/* Robot AZero Cheering & Speaking */}
        <div className="shrink-0 flex flex-col items-center">
          <AZeroMascot
            size="large"
            isSpeaking={speechService.isSpeaking}
            isPaused={speechService.isPaused}
            isMuted={isMuted}
            currentChunkText={currentChunk}
            customImageUrl={azeroImageUrl}
            onToggleMute={onToggleMute}
            onReplay={() => {
              speechService.speakTextChunks([
                `Xin chúc mừng đội ${winningName} đã xuất sắc giành chiến thắng với ${winningScore} điểm! Cảm ơn toàn thể thầy cô và các bạn!`
              ], {
                onChunkChange: (c) => setCurrentChunk(c)
              });
            }}
            badgeLabel="AZero • Chúc mừng chiến thắng"
          />
        </div>

        {/* Winner Showcase Card */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 15 }}
          className={`flex-1 max-w-xl p-8 rounded-3xl border-4 shadow-2xl text-center bg-white ${
            winnerTeam === 1
              ? 'border-blue-500 shadow-blue-200'
              : 'border-red-500 shadow-red-200'
          }`}
        >
          <div className="relative inline-block mb-3">
            <Trophy className="w-20 h-20 text-amber-500 drop-shadow-md animate-bounce" />
            <Sparkles className="w-7 h-7 text-amber-400 absolute -top-2 -right-2 animate-spin" />
          </div>

          <span className="block text-sm font-black uppercase tracking-widest text-amber-600">
            ĐỘI QUÁN QUÂN
          </span>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 mt-1 mb-4">
            {winningName}
          </h2>

          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div>
              <span className="text-xs text-slate-500 font-bold uppercase">Điểm {winningName}</span>
              <p className="text-3xl font-black text-green-600">{winningScore}</p>
            </div>
            <div>
              <span className="text-xs text-slate-500 font-bold uppercase">Điểm {runnerUpName}</span>
              <p className="text-3xl font-black text-slate-400">{runnerUpScore}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* BOTTOM CONTROLS */}
      <div className="relative z-10 flex items-center justify-center gap-4 mt-2">
        <button
          onClick={onRestartGame}
          className="flex items-center gap-2 py-3 px-8 rounded-2xl bg-blue-600 hover:bg-blue-700 border-2 border-blue-500 text-white font-black text-base shadow-xl transition cursor-pointer"
        >
          <RotateCcw className="w-5 h-5" />
          <span>BẮT ĐẦU LẠI TRẬN ĐẤU</span>
        </button>
      </div>
    </div>
  );
};
