import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Trophy } from 'lucide-react';

interface TugOfWarArenaProps {
  team1Name: string;
  team2Name: string;
  team1Score: number;
  team2Score: number;
  activeTeam: 1 | 2;
  lastScoringTeam: 1 | 2 | null;
  isPullingAnim: boolean;
}

export const TugOfWarArena: React.FC<TugOfWarArenaProps> = ({
  team1Name,
  team2Name,
  team1Score,
  team2Score,
  activeTeam,
  lastScoringTeam,
  isPullingAnim
}) => {
  // Rope position calculation: (team1Score - team2Score)
  // Each point shifts rope ~38px horizontally (capped at +- 240px)
  const scoreDiff = team1Score - team2Score;
  const ropeShiftPx = Math.max(-240, Math.min(240, scoreDiff * -38)); // Left is negative, right is positive

  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden select-none bg-gradient-to-b from-[#0c152a] via-[#090e1c] to-[#060a14] border-b-2 border-cyan-500/30 rounded-2xl shadow-xl">
      {/* Background Cyber Ambience: dot grid & soft cyber glows */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:20px_20px]"></div>
      <div className="absolute -top-24 left-1/4 w-80 h-80 bg-cyan-500/10 rounded-full filter blur-3xl pointer-events-none"></div>
      <div className="absolute -top-24 right-1/4 w-80 h-80 bg-rose-500/10 rounded-full filter blur-3xl pointer-events-none"></div>

      {/* TOP HEADER: Team Banners & Score Badges (Modern Dark Cyber Theme) */}
      <div className="relative z-10 w-full px-6 pt-3 flex items-center justify-between gap-4">
        {/* TEAM 1 HEADER (Cyber Blue) */}
        <motion.div
          animate={
            activeTeam === 1
              ? { scale: [1, 1.02, 1], transition: { repeat: Infinity, duration: 1.6 } }
              : { scale: 1 }
          }
          className={`flex-1 max-w-sm rounded-2xl p-3 border transition-all duration-300 shadow-xl ${
            activeTeam === 1
              ? 'bg-gradient-to-r from-blue-900/90 to-cyan-950/90 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)] ring-2 ring-cyan-400/40 text-white'
              : 'bg-slate-900/80 border-slate-800 text-slate-300 opacity-90 shadow-md'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-3.5 h-3.5 rounded-full ${activeTeam === 1 ? 'bg-cyan-400 animate-ping' : 'bg-slate-600'}`} />
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-cyan-300">ĐỘI 1</span>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-none drop-shadow-sm">
                  {team1Name}
                </h2>
              </div>
            </div>
            {/* Score pill */}
            <div className="flex flex-col items-center bg-cyan-950/70 border border-cyan-500/40 px-3.5 py-1 rounded-xl shadow-inner">
              <span className="text-[10px] font-bold uppercase text-cyan-300">Đúng</span>
              <span className="text-2xl font-black text-white leading-tight">
                {team1Score < 10 ? `0${team1Score}` : team1Score}
              </span>
            </div>
          </div>

          {/* Turn Indicator Banner */}
          {activeTeam === 1 ? (
            <div className="mt-2 text-center py-1 px-2 rounded-lg bg-cyan-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow flex items-center justify-center gap-1.5 animate-pulse">
              <Sparkles className="w-3.5 h-3.5 text-slate-950" />
              ĐANG LỰA CHỌN CÂU HỎI
            </div>
          ) : (
            <div className="mt-2 text-center py-1 px-2 rounded-lg bg-slate-950/60 text-slate-400 text-xs font-medium">
              Chờ đến lượt
            </div>
          )}
        </motion.div>

        {/* CENTER VS / MATCH GAUGE */}
        <div className="flex flex-col items-center shrink-0 px-2">
          <div className="px-3.5 py-1 rounded-full bg-slate-900 border border-slate-700 text-cyan-300 font-black text-xs sm:text-sm tracking-widest shadow-md flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>ĐỐI KHÁNG</span>
          </div>
          <div className="mt-1 text-xs font-bold">
            {scoreDiff > 0 ? (
              <span className="text-cyan-300 bg-cyan-950/80 px-2.5 py-0.5 rounded-full border border-cyan-500/40">{team1Name} dẫn +{scoreDiff}</span>
            ) : scoreDiff < 0 ? (
              <span className="text-rose-300 bg-rose-950/80 px-2.5 py-0.5 rounded-full border border-rose-500/40">{team2Name} dẫn +{Math.abs(scoreDiff)}</span>
            ) : (
              <span className="text-slate-400 bg-slate-900/80 px-2.5 py-0.5 rounded-full border border-slate-800">Cân bằng 0 - 0</span>
            )}
          </div>
        </div>

        {/* TEAM 2 HEADER (Cyber Red) */}
        <motion.div
          animate={
            activeTeam === 2
              ? { scale: [1, 1.02, 1], transition: { repeat: Infinity, duration: 1.6 } }
              : { scale: 1 }
          }
          className={`flex-1 max-w-sm rounded-2xl p-3 border transition-all duration-300 shadow-xl ${
            activeTeam === 2
              ? 'bg-gradient-to-r from-rose-950/90 to-red-900/90 border-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.3)] ring-2 ring-rose-400/40 text-white'
              : 'bg-slate-900/80 border-slate-800 text-slate-300 opacity-90 shadow-md'
          }`}
        >
          <div className="flex items-center justify-between">
            {/* Score pill */}
            <div className="flex flex-col items-center bg-rose-950/70 border border-rose-500/40 px-3.5 py-1 rounded-xl shadow-inner">
              <span className="text-[10px] font-bold uppercase text-rose-300">Đúng</span>
              <span className="text-2xl font-black text-white leading-tight">
                {team2Score < 10 ? `0${team2Score}` : team2Score}
              </span>
            </div>

            <div className="flex items-center gap-2 text-right">
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-rose-300">ĐỘI 2</span>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-none drop-shadow-sm">
                  {team2Name}
                </h2>
              </div>
              <span className={`w-3.5 h-3.5 rounded-full ${activeTeam === 2 ? 'bg-rose-400 animate-ping' : 'bg-slate-600'}`} />
            </div>
          </div>

          {/* Turn Indicator Banner */}
          {activeTeam === 2 ? (
            <div className="mt-2 text-center py-1 px-2 rounded-lg bg-rose-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow flex items-center justify-center gap-1.5 animate-pulse">
              <Sparkles className="w-3.5 h-3.5 text-slate-950" />
              ĐANG LỰA CHỌN CÂU HỎI
            </div>
          ) : (
            <div className="mt-2 text-center py-1 px-2 rounded-lg bg-slate-950/60 text-slate-400 text-xs font-medium">
              Chờ đến lượt
            </div>
          )}
        </motion.div>
      </div>

      {/* CONTINUOUS TUG-OF-WAR ARENA: Continuous rope & cyber arena floor */}
      <div className="relative w-full flex-1 flex items-end justify-center min-h-[200px] sm:min-h-[230px] pb-3">
        {/* ARENA GROUND FLOOR: Cyber High-Tech Floor with Laser Center */}
        <div className="absolute bottom-0 inset-x-0 h-14 sm:h-18 bg-[#0a1020] border-t-2 border-cyan-500/30 flex items-center justify-center">
          {/* Subtle grid stripe */}
          <div className="absolute inset-x-0 bottom-0 h-4 bg-cyan-950/30"></div>

          {/* Center Marker Laser Line */}
          <div className="absolute bottom-0 flex flex-col items-center pointer-events-none">
            {/* Center line */}
            <div className="w-1.5 h-16 bg-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.8)]"></div>
            {/* Center circle */}
            <div className="absolute bottom-0 w-24 h-6 border-2 border-cyan-400/80 rounded-[50%] bg-cyan-500/10 shadow-[0_0_15px_rgba(6,182,212,0.3)]"></div>
            {/* Marker Label */}
            <span className="absolute -top-5 text-[10px] font-black uppercase tracking-wider text-cyan-300 bg-slate-900 px-2.5 py-0.5 rounded border border-cyan-500/50 shadow-md">
              VẠCH CHÍNH GIỮA
            </span>
          </div>

          {/* Laser tick marks along ground */}
          {[-4, -3, -2, -1, 1, 2, 3, 4].map(tick => (
            <div
              key={tick}
              style={{ left: `calc(50% + ${tick * 48}px)` }}
              className="absolute bottom-0 flex flex-col items-center opacity-70"
            >
              <div className="w-0.5 h-4 bg-cyan-500/50"></div>
              <span className="text-[9px] font-bold text-cyan-400/80">{Math.abs(tick)}</span>
            </div>
          ))}
        </div>

        {/* MOVING TUG SCENARIO (Continuous SVG Canvas containing Team 1, Rope, Ribbon, Team 2) */}
        <motion.div
          animate={{
            x: ropeShiftPx,
            scale: isPullingAnim ? 1.02 : 1
          }}
          transition={{
            type: "spring",
            stiffness: 120,
            damping: 14,
            mass: 1.1
          }}
          className="relative z-20 w-full max-w-5xl flex items-end justify-center px-4"
        >
          <svg
            viewBox="0 0 1000 240"
            className="w-full h-48 sm:h-60 overflow-visible select-none drop-shadow-xl"
          >
            <defs>
              {/* Braided Rope Pattern */}
              <pattern id="ropeBraided" width="16" height="16" patternUnits="userSpaceOnUse">
                <path d="M0 16 L16 0 M-4 4 L4 -4 M12 20 L20 12" stroke="#d97706" strokeWidth="3" />
                <path d="M0 0 L16 16 M-4 12 L4 20 M12 -4 L20 4" stroke="#92400e" strokeWidth="2.5" />
              </pattern>
              {/* Ribbon Red Gradient */}
              <linearGradient id="redRibbon" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#991b1b" />
              </linearGradient>
            </defs>

            {/* 1. CONTINUOUS THICK TUG-OF-WAR ROPE spanning across the entire screen through all hands */}
            <path
              d="M 60 148 Q 280 148, 500 148 Q 720 148, 940 148"
              stroke="#78350f"
              strokeWidth="16"
              strokeLinecap="round"
            />
            <path
              d="M 60 148 Q 280 148, 500 148 Q 720 148, 940 148"
              stroke="url(#ropeBraided)"
              strokeWidth="12"
              strokeLinecap="round"
            />
            {/* Tassel ends */}
            <path d="M 60 148 L 40 142 M 60 148 L 38 148 M 60 148 L 42 154" stroke="#d97706" strokeWidth="4" strokeLinecap="round" />
            <path d="M 940 148 L 960 142 M 940 148 L 962 148 M 940 148 L 958 154" stroke="#d97706" strokeWidth="4" strokeLinecap="round" />

            {/* 2. RED RIBBON IN THE CENTER OF ROPE (fluttering) */}
            <g transform="translate(500, 148)">
              {/* Ribbon knot tied around rope */}
              <circle cx="0" cy="0" r="10" fill="#dc2626" stroke="#7f1d1d" strokeWidth="2.5" />
              <circle cx="0" cy="0" r="4" fill="#fef08a" />
              {/* Hanging flutter ribbon legs */}
              <path
                d="M -3 6 C -8 24, -14 38, -12 55 L -3 50 L -1 56 C -4 40, -1 25, 0 6 Z"
                fill="url(#redRibbon)"
                stroke="#7f1d1d"
                strokeWidth="1"
              />
              <path
                d="M 3 6 C 8 24, 15 36, 11 54 L 3 49 L 1 55 C 3 39, 2 24, 0 6 Z"
                fill="url(#redRibbon)"
                stroke="#7f1d1d"
                strokeWidth="1"
              />
              {/* Gold bell accent */}
              <circle cx="0" cy="8" r="3.5" fill="#facc15" />
            </g>

            {/* 3. TEAM 1 (LEFT SIDE - BLUE UNIFORMS, LEANING BACKWARDS TO PULL LEFT) */}
            {/* Player 3 (Anchor - Back) */}
            <g transform="translate(130, 45)">
              <PlayerFigure
                team="blue"
                role="anchor"
                isPulling={isPullingAnim && lastScoringTeam === 1}
                isDragged={isPullingAnim && lastScoringTeam === 2}
                facing="right"
              />
            </g>
            {/* Player 2 (Middle) */}
            <g transform="translate(210, 50)">
              <PlayerFigure
                team="blue"
                role="middle"
                isPulling={isPullingAnim && lastScoringTeam === 1}
                isDragged={isPullingAnim && lastScoringTeam === 2}
                facing="right"
              />
            </g>
            {/* Player 1 (Lead - Front) */}
            <g transform="translate(290, 45)">
              <PlayerFigure
                team="blue"
                role="lead"
                isPulling={isPullingAnim && lastScoringTeam === 1}
                isDragged={isPullingAnim && lastScoringTeam === 2}
                facing="right"
              />
            </g>

            {/* 4. TEAM 2 (RIGHT SIDE - RED UNIFORMS, LEANING BACKWARDS TO PULL RIGHT) */}
            {/* Player 1 (Lead - Front) */}
            <g transform="translate(620, 45)">
              <PlayerFigure
                team="red"
                role="lead"
                isPulling={isPullingAnim && lastScoringTeam === 2}
                isDragged={isPullingAnim && lastScoringTeam === 1}
                facing="left"
              />
            </g>
            {/* Player 2 (Middle) */}
            <g transform="translate(700, 50)">
              <PlayerFigure
                team="red"
                role="middle"
                isPulling={isPullingAnim && lastScoringTeam === 2}
                isDragged={isPullingAnim && lastScoringTeam === 1}
                facing="left"
              />
            </g>
            {/* Player 3 (Anchor - Back) */}
            <g transform="translate(780, 45)">
              <PlayerFigure
                team="red"
                role="anchor"
                isPulling={isPullingAnim && lastScoringTeam === 2}
                isDragged={isPullingAnim && lastScoringTeam === 1}
                facing="left"
              />
            </g>
          </svg>
        </motion.div>
      </div>
    </div>
  );
};

// 2D Cartoon High School Tug-Of-War Competitor Figure
interface PlayerFigureProps {
  team: 'blue' | 'red';
  role: 'lead' | 'middle' | 'anchor';
  isPulling: boolean;
  isDragged: boolean;
  facing: 'right' | 'left';
}

const PlayerFigure: React.FC<PlayerFigureProps> = ({
  team,
  role,
  isPulling,
  isDragged,
  facing
}) => {
  const isBlue = team === 'blue';

  // Leaning angle: when facing right (Team 1), leaning back means rotating slightly counter-clockwise (-15 to -25 deg)
  // When pulling hard, lean even more backwards!
  let leanRotation = facing === 'right' ? -18 : 18;
  if (isPulling) {
    leanRotation = facing === 'right' ? -28 : 28;
  } else if (isDragged) {
    // When dragged forward by opponent, lean angle flattens towards center
    leanRotation = facing === 'right' ? -4 : 4;
  }

  const primaryColor = isBlue ? '#2563eb' : '#dc2626';
  const secondaryColor = isBlue ? '#1d4ed8' : '#b91c1c';
  const headbandColor = isBlue ? '#38bdf8' : '#fb923c';
  const skinTone = role === 'lead' ? '#fed7aa' : role === 'middle' ? '#fde047' : '#ffedd5';
  const hairColor = role === 'lead' ? '#1e293b' : role === 'middle' ? '#451a03' : '#0f172a';

  return (
    <g
      transform={`rotate(${leanRotation}, ${facing === 'right' ? 50 : 50}, 150)`}
      className="transition-transform duration-300"
    >
      {/* Strain / pull dust puff when pulling */}
      {isPulling && (
        <circle
          cx={facing === 'right' ? 20 : 80}
          cy="150"
          r="10"
          fill="#cbd5e1"
          opacity="0.4"
          className="animate-ping"
        />
      )}

      {/* BACK LEG (braced firmly against the ground) */}
      <path
        d={
          facing === 'right'
            ? "M 42 110 L 15 150 L 5 152"
            : "M 58 110 L 85 150 L 95 152"
        }
        stroke="#1e293b"
        strokeWidth="14"
        strokeLinecap="round"
      />
      {/* Shoe back */}
      <ellipse
        cx={facing === 'right' ? 12 : 88}
        cy="150"
        rx="10"
        ry="6"
        fill="#0f172a"
        stroke="#64748b"
        strokeWidth="2"
      />

      {/* FRONT LEG (bent at knee for leverage) */}
      <path
        d={
          facing === 'right'
            ? "M 52 110 L 58 135 L 45 150"
            : "M 48 110 L 42 135 L 55 150"
        }
        stroke="#0f172a"
        strokeWidth="13"
        strokeLinecap="round"
      />
      {/* Shoe front */}
      <ellipse
        cx={facing === 'right' ? 46 : 54}
        cy="150"
        rx="9"
        ry="5"
        fill="#0f172a"
        stroke="#64748b"
        strokeWidth="2"
      />

      {/* TORSO / JERSEY (athletic school shirt) */}
      <path
        d="M 35 62 L 65 62 L 60 115 L 40 115 Z"
        fill={primaryColor}
        stroke={secondaryColor}
        strokeWidth="3"
      />
      {/* Jersey stripe */}
      <rect x="46" y="66" width="8" height="42" fill="#ffffff" opacity="0.3" rx="2" />

      {/* HEAD */}
      <circle cx="50" cy="38" r="18" fill={skinTone} stroke="#78350f" strokeWidth="1.5" />

      {/* HAIR */}
      <path
        d="M 32 36 Q 50 16 68 36 Q 64 22 50 20 Q 36 22 32 36 Z"
        fill={hairColor}
      />

      {/* HEADBAND (Spirit headband) */}
      <rect x="33" y="32" width="34" height="6" rx="2" fill={headbandColor} />

      {/* EYES (Determined pulling expression: angled brows) */}
      {facing === 'right' ? (
        <>
          {/* Eyebrow & eye */}
          <path d="M 52 36 L 62 39" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" />
          <ellipse cx="58" cy="41" rx="2.5" ry="3" fill="#000000" />
          {/* Grit teeth / open mouth strain */}
          <rect x="54" y="47" width="8" height="4" rx="1.5" fill="#ffffff" stroke="#991b1b" strokeWidth="1" />
          {/* Sweat drop when pulling */}
          {isPulling && (
            <path d="M 64 30 Q 66 33 65 35 Q 64 33 64 30 Z" fill="#38bdf8" />
          )}
        </>
      ) : (
        <>
          {/* Eyebrow & eye */}
          <path d="M 48 36 L 38 39" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" />
          <ellipse cx="42" cy="41" rx="2.5" ry="3" fill="#000000" />
          {/* Grit teeth / open mouth strain */}
          <rect x="38" y="47" width="8" height="4" rx="1.5" fill="#ffffff" stroke="#991b1b" strokeWidth="1" />
          {/* Sweat drop when pulling */}
          {isPulling && (
            <path d="M 36 30 Q 34 33 35 35 Q 36 33 36 30 Z" fill="#38bdf8" />
          )}
        </>
      )}

      {/* ARMS GRIPPING ROPE TIGHTLY (Both arms reaching to rope at Y=103) */}
      {/* Back arm */}
      <path
        d={
          facing === 'right'
            ? "M 42 70 L 62 98 L 72 102"
            : "M 58 70 L 38 98 L 28 102"
        }
        stroke={skinTone}
        strokeWidth="8"
        strokeLinecap="round"
      />
      {/* Front arm */}
      <path
        d={
          facing === 'right'
            ? "M 54 72 L 70 94 L 80 102"
            : "M 46 72 L 30 94 L 20 102"
        }
        stroke={skinTone}
        strokeWidth="8"
        strokeLinecap="round"
      />
      {/* Hands clenching the rope */}
      <circle cx={facing === 'right' ? 74 : 26} cy="103" r="6" fill={skinTone} stroke="#78350f" strokeWidth="1.5" />
      <circle cx={facing === 'right' ? 82 : 18} cy="103" r="6" fill={skinTone} stroke="#78350f" strokeWidth="1.5" />
    </g>
  );
};
