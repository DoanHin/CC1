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
  // Each point shifts rope ~32px horizontally (capped at +- 200px)
  const scoreDiff = team1Score - team2Score;
  const ropeShiftPx = Math.max(-200, Math.min(200, scoreDiff * -32)); // Left is negative, right is positive

  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden select-none bg-gradient-to-b from-white via-slate-50 to-slate-100 border border-slate-200 rounded-2xl shadow-sm">
      {/* Background Court Ambience */}
      <div className="absolute inset-0 pointer-events-none opacity-25 bg-[radial-gradient(#64748b_1px,transparent_1px)] [background-size:20px_20px]"></div>
      <div className="absolute -top-20 left-1/4 w-72 h-72 bg-blue-400/10 rounded-full filter blur-3xl pointer-events-none"></div>
      <div className="absolute -top-20 right-1/4 w-72 h-72 bg-rose-400/10 rounded-full filter blur-3xl pointer-events-none"></div>

      {/* TOP HEADER: Compact Team Banners & Score Badges (Never overlaps the pullers below) */}
      <div className="relative z-10 w-full px-3 sm:px-5 pt-2 pb-1 flex items-center justify-between gap-2 sm:gap-3 shrink-0">
        {/* TEAM 1 HEADER (Blue Team) */}
        <motion.div
          animate={
            activeTeam === 1
              ? { scale: [1, 1.015, 1], transition: { repeat: Infinity, duration: 1.6 } }
              : { scale: 1 }
          }
          className={`flex-1 max-w-xs sm:max-w-sm rounded-xl px-3 py-1.5 sm:py-2 border transition-all duration-300 shadow-sm ${
            activeTeam === 1
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 border-2 border-blue-400 text-white ring-2 ring-blue-300/60 shadow-md'
              : 'bg-white border-slate-200 text-slate-800 opacity-90'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className={`w-3 h-3 shrink-0 rounded-full ${activeTeam === 1 ? 'bg-white animate-ping' : 'bg-blue-600'}`} />
              <div className="truncate">
                <span className={`text-[10px] font-black uppercase tracking-wider block leading-none ${activeTeam === 1 ? 'text-blue-100' : 'text-blue-600'}`}>
                  ĐỘI 1
                </span>
                <h2 className={`text-base sm:text-lg font-black tracking-tight leading-tight truncate ${activeTeam === 1 ? 'text-white' : 'text-slate-900'}`}>
                  {team1Name}
                </h2>
              </div>
            </div>

            {/* Score pill */}
            <div className={`flex items-center gap-1 px-2.5 py-0.5 rounded-lg shrink-0 shadow-inner ${
              activeTeam === 1 ? 'bg-white/20 border border-white/30 text-white' : 'bg-blue-50 border border-blue-200 text-blue-700'
            }`}>
              <span className={`text-[10px] font-bold uppercase ${activeTeam === 1 ? 'text-blue-100' : 'text-blue-600'}`}>Đúng</span>
              <span className="text-lg sm:text-xl font-black leading-none">
                {team1Score < 10 ? `0${team1Score}` : team1Score}
              </span>
            </div>
          </div>

          {/* Turn Indicator Banner */}
          {activeTeam === 1 && (
            <div className="mt-1 text-center py-0.5 px-2 rounded-md bg-white text-blue-700 font-black text-[10px] sm:text-xs uppercase tracking-wider shadow flex items-center justify-center gap-1 animate-pulse">
              <Sparkles className="w-3 h-3 text-blue-600" />
              ĐANG CHỌN CÂU HỎI
            </div>
          )}
        </motion.div>

        {/* CENTER VS / MATCH GAUGE */}
        <div className="flex flex-col items-center shrink-0 px-1 sm:px-2">
          <div className="px-2.5 py-0.5 rounded-full bg-white border border-slate-200 text-slate-800 font-black text-[11px] sm:text-xs tracking-wider shadow-sm flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span>ĐỐI KHÁNG</span>
          </div>
          <div className="mt-0.5 text-[11px] font-bold">
            {scoreDiff > 0 ? (
              <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 font-black">{team1Name} +{scoreDiff}</span>
            ) : scoreDiff < 0 ? (
              <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 font-black">{team2Name} +{Math.abs(scoreDiff)}</span>
            ) : (
              <span className="text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">Hòa 0 - 0</span>
            )}
          </div>
        </div>

        {/* TEAM 2 HEADER (Red Team) */}
        <motion.div
          animate={
            activeTeam === 2
              ? { scale: [1, 1.015, 1], transition: { repeat: Infinity, duration: 1.6 } }
              : { scale: 1 }
          }
          className={`flex-1 max-w-xs sm:max-w-sm rounded-xl px-3 py-1.5 sm:py-2 border transition-all duration-300 shadow-sm ${
            activeTeam === 2
              ? 'bg-gradient-to-r from-rose-600 to-red-600 border-2 border-rose-400 text-white ring-2 ring-rose-300/60 shadow-md'
              : 'bg-white border-slate-200 text-slate-800 opacity-90'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            {/* Score pill */}
            <div className={`flex items-center gap-1 px-2.5 py-0.5 rounded-lg shrink-0 shadow-inner ${
              activeTeam === 2 ? 'bg-white/20 border border-white/30 text-white' : 'bg-rose-50 border border-rose-200 text-rose-700'
            }`}>
              <span className={`text-[10px] font-bold uppercase ${activeTeam === 2 ? 'text-rose-100' : 'text-rose-600'}`}>Đúng</span>
              <span className="text-lg sm:text-xl font-black leading-none">
                {team2Score < 10 ? `0${team2Score}` : team2Score}
              </span>
            </div>

            <div className="flex items-center gap-2 min-w-0 text-right">
              <div className="truncate">
                <span className={`text-[10px] font-black uppercase tracking-wider block leading-none ${activeTeam === 2 ? 'text-rose-100' : 'text-rose-600'}`}>
                  ĐỘI 2
                </span>
                <h2 className={`text-base sm:text-lg font-black tracking-tight leading-tight truncate ${activeTeam === 2 ? 'text-white' : 'text-slate-900'}`}>
                  {team2Name}
                </h2>
              </div>
              <span className={`w-3 h-3 shrink-0 rounded-full ${activeTeam === 2 ? 'bg-white animate-ping' : 'bg-rose-600'}`} />
            </div>
          </div>

          {/* Turn Indicator Banner */}
          {activeTeam === 2 && (
            <div className="mt-1 text-center py-0.5 px-2 rounded-md bg-white text-rose-700 font-black text-[10px] sm:text-xs uppercase tracking-wider shadow flex items-center justify-center gap-1 animate-pulse">
              <Sparkles className="w-3 h-3 text-rose-600" />
              ĐANG CHỌN CÂU HỎI
            </div>
          )}
        </motion.div>
      </div>

      {/* CONTINUOUS TUG-OF-WAR ARENA COURT */}
      <div className="relative w-full flex-1 flex items-center justify-center overflow-hidden px-1 py-0.5 min-h-[160px]">
        <svg
          viewBox="0 5 1000 180"
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-full max-h-[280px] select-none drop-shadow-sm"
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
            {/* Stadium Court Ground Gradient */}
            <linearGradient id="courtGroundGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#e2e8f0" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </linearGradient>
          </defs>

          {/* STATIC ARENA COURT FLOOR (Ground surface & center marker never shift) */}
          {/* Ground floor block */}
          <rect x="0" y="150" width="1000" height="35" fill="url(#courtGroundGrad)" />
          {/* Court surface line */}
          <line x1="0" y1="150" x2="1000" y2="150" stroke="#94a3b8" strokeWidth="2" />

          {/* Center Laser Line (Stadium Arena Center Pin) */}
          <line x1="500" y1="130" x2="500" y2="185" stroke="#2563eb" strokeWidth="3" strokeDasharray="4 2" />
          <rect x="498" y="148" width="4" height="37" fill="#2563eb" />
          {/* Center laser pin indicator */}
          <circle cx="500" cy="150" r="4" fill="#60a5fa" stroke="#1d4ed8" strokeWidth="1.5" />

          {/* Distance tick marks along the court floor */}
          {[-4, -3, -2, -1, 1, 2, 3, 4].map((tick) => {
            const tickX = 500 + tick * 52;
            return (
              <g key={tick} opacity={0.65}>
                <line x1={tickX} y1="150" x2={tickX} y2="159" stroke="#64748b" strokeWidth="1.5" />
                <text x={tickX} y="169" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#64748b">
                  {Math.abs(tick)}
                </text>
              </g>
            );
          })}

          {/* Center Line Badge on Floor */}
          <g transform="translate(500, 175)">
            <rect x="-44" y="-7.5" width="88" height="15" rx="4" fill="#ffffff" stroke="#93c5fd" strokeWidth="1" />
            <text x="0" y="3.5" textAnchor="middle" fontSize="8" fontWeight="900" fill="#1d4ed8" letterSpacing="0.5">
              VẠCH TRUNG TÂM
            </text>
          </g>

          {/* DYNAMIC SHIFTING TUG-OF-WAR UNIT (Rope, ribbon & 6 players move together) */}
          <g
            style={{
              transform: `translateX(${ropeShiftPx}px)`,
              transition: isPullingAnim ? 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'transform 0.5s ease-out'
            }}
          >
            {/* 1. CONTINUOUS THICK TUG-OF-WAR ROPE at Y=105 */}
            <path
              d="M 50 105 L 950 105"
              stroke="#78350f"
              strokeWidth="15"
              strokeLinecap="round"
            />
            <path
              d="M 50 105 L 950 105"
              stroke="url(#ropeBraided)"
              strokeWidth="11"
              strokeLinecap="round"
            />
            {/* Tassel ends */}
            <path d="M 50 105 L 32 99 M 50 105 L 30 105 M 50 105 L 34 111" stroke="#d97706" strokeWidth="4" strokeLinecap="round" />
            <path d="M 950 105 L 968 99 M 950 105 L 970 105 M 950 105 L 966 111" stroke="#d97706" strokeWidth="4" strokeLinecap="round" />

            {/* 2. RED RIBBON IN THE CENTER OF ROPE (Center at 500, 105) */}
            <g transform="translate(500, 105)">
              {/* Ribbon knot tied around rope */}
              <circle cx="0" cy="0" r="9.5" fill="#dc2626" stroke="#7f1d1d" strokeWidth="2" />
              <circle cx="0" cy="0" r="4" fill="#fef08a" />
              {/* Hanging flutter ribbon legs */}
              <path
                d="M -3 5 C -7 16, -11 26, -9 35 L -2 32 L 0 36 C -3 26, 0 16, 0 5 Z"
                fill="url(#redRibbon)"
                stroke="#7f1d1d"
                strokeWidth="1"
              />
              <path
                d="M 3 5 C 7 16, 12 25, 9 35 L 2 32 L 1 36 C 3 26, 2 16, 0 5 Z"
                fill="url(#redRibbon)"
                stroke="#7f1d1d"
                strokeWidth="1"
              />
              {/* Gold bell accent */}
              <circle cx="0" cy="6" r="3" fill="#facc15" />
            </g>

            {/* 3. TEAM 1 (LEFT SIDE - BLUE UNIFORMS) */}
            {/* Player 3 (Anchor) */}
            <g transform="translate(130, 0)">
              <PlayerFigure
                team="blue"
                role="anchor"
                isPulling={isPullingAnim && lastScoringTeam === 1}
                isDragged={isPullingAnim && lastScoringTeam === 2}
                facing="right"
              />
            </g>
            {/* Player 2 (Middle) */}
            <g transform="translate(220, 0)">
              <PlayerFigure
                team="blue"
                role="middle"
                isPulling={isPullingAnim && lastScoringTeam === 1}
                isDragged={isPullingAnim && lastScoringTeam === 2}
                facing="right"
              />
            </g>
            {/* Player 1 (Lead - Front) */}
            <g transform="translate(310, 0)">
              <PlayerFigure
                team="blue"
                role="lead"
                isPulling={isPullingAnim && lastScoringTeam === 1}
                isDragged={isPullingAnim && lastScoringTeam === 2}
                facing="right"
              />
            </g>

            {/* 4. TEAM 2 (RIGHT SIDE - RED UNIFORMS) */}
            {/* Player 1 (Lead - Front) */}
            <g transform="translate(590, 0)">
              <PlayerFigure
                team="red"
                role="lead"
                isPulling={isPullingAnim && lastScoringTeam === 2}
                isDragged={isPullingAnim && lastScoringTeam === 1}
                facing="left"
              />
            </g>
            {/* Player 2 (Middle) */}
            <g transform="translate(680, 0)">
              <PlayerFigure
                team="red"
                role="middle"
                isPulling={isPullingAnim && lastScoringTeam === 2}
                isDragged={isPullingAnim && lastScoringTeam === 1}
                facing="left"
              />
            </g>
            {/* Player 3 (Anchor - Back) */}
            <g transform="translate(770, 0)">
              <PlayerFigure
                team="red"
                role="anchor"
                isPulling={isPullingAnim && lastScoringTeam === 2}
                isDragged={isPullingAnim && lastScoringTeam === 1}
                facing="left"
              />
            </g>
          </g>
        </svg>
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
