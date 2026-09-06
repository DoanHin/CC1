import React from 'react';
import { Volume2, VolumeX, Play, Pause, RotateCcw } from 'lucide-react';
import { motion } from 'motion/react';

interface AZeroMascotProps {
  size?: 'large' | 'compact' | 'mini';
  isSpeaking: boolean;
  isPaused: boolean;
  isMuted: boolean;
  currentChunkText?: string;
  customImageUrl?: string;
  onPlay?: () => void;
  onPause?: () => void;
  onReplay?: () => void;
  onToggleMute?: () => void;
  showSpeechBubble?: boolean;
  showBadge?: boolean;
  bubblePosition?: 'top' | 'right' | 'left' | 'bottom';
  glowColor?: string;
  badgeLabel?: string;
  lightTheme?: boolean;
}

export const AZeroMascot: React.FC<AZeroMascotProps> = ({
  size = 'compact',
  isSpeaking,
  isPaused,
  isMuted,
  currentChunkText,
  customImageUrl,
  onPlay,
  onPause,
  onReplay,
  onToggleMute,
  showSpeechBubble = true,
  showBadge = false,
  bubblePosition = 'top',
  badgeLabel = "AZero • 11A0 Robotics",
  lightTheme = false
}) => {
  const isLarge = size === 'large';
  const isCompact = size === 'compact';

  return (
    <div className="relative flex flex-col items-center select-none">
      {/* Speech Bubble (Chunked text presentation) */}
      {showSpeechBubble && currentChunkText && currentChunkText.trim().length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.25 }}
          className={`z-30 max-w-xl px-4 sm:px-5 py-2.5 sm:py-3.5 rounded-2xl shadow-md border-2 ${
            lightTheme
              ? isSpeaking
                ? 'bg-blue-50 border-blue-400 text-blue-950 ring-2 ring-blue-200'
                : 'bg-white border-slate-200 text-slate-800'
              : isSpeaking
                ? 'bg-blue-900 border-blue-600 text-white ring-2 ring-blue-400/50'
                : 'bg-blue-950 border-blue-800 text-blue-100'
          } ${
            bubblePosition === 'top'
              ? 'mb-4'
              : bubblePosition === 'right'
              ? 'ml-4'
              : bubblePosition === 'left'
              ? 'mr-4'
              : 'mt-4'
          }`}
        >
          <div className="flex items-start gap-3">
            {isSpeaking && (
              <div className="flex items-center gap-1 mt-1 shrink-0">
                <span className="w-1.5 h-3.5 bg-blue-300 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-5 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-4 bg-blue-300 rounded-full animate-bounce"></span>
              </div>
            )}
            <p className="text-sm sm:text-base font-bold leading-relaxed">
              “{currentChunkText}”
            </p>
          </div>
        </motion.div>
      )}

      {/* Robot Body Container with gentle bobbing/hovering */}
      <motion.div
        animate={
          isSpeaking
            ? {
                y: [0, -8, 0],
                rotate: [0, -1, 1, 0],
                transition: { repeat: Infinity, duration: 1.8, ease: "easeInOut" }
              }
            : {
                y: [0, -4, 0],
                transition: { repeat: Infinity, duration: 3.2, ease: "easeInOut" }
              }
        }
        className="relative group cursor-pointer"
      >
        {/* Glow Halo behind robot */}
        <div
          className={`absolute -inset-4 rounded-full filter blur-xl opacity-60 transition-all duration-500 pointer-events-none ${
            isSpeaking
              ? 'bg-blue-400/40 animate-pulse'
              : 'bg-blue-300/20'
          }`}
        />

        {/* Custom Image or Crisp Vector 2D/3D Robot */}
        {customImageUrl ? (
          <div className={`relative rounded-3xl overflow-hidden border-4 border-blue-400 shadow-xl bg-white ${
            isLarge ? 'w-64 h-64' : isCompact ? 'w-36 h-36' : 'w-20 h-20'
          }`}>
            <img
              src={customImageUrl}
              alt="Robot AZero"
              className="w-full h-full object-contain p-2"
            />
          </div>
        ) : (
          <div
            className={`relative flex items-center justify-center bg-transparent ${
              isLarge ? 'w-56 h-56 sm:w-64 sm:h-64' : isCompact ? 'w-36 h-36' : 'w-24 h-24'
            }`}
          >
            <svg
              viewBox="0 0 240 240"
              className="w-full h-full drop-shadow-md overflow-visible"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="bodyGrad" x1="20%" y1="0%" x2="80%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="70%" stopColor="#f1f5f9" />
                  <stop offset="100%" stopColor="#cbd5e1" />
                </linearGradient>
                <linearGradient id="cyanAccent" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7dd3fc" />
                  <stop offset="100%" stopColor="#0284c7" />
                </linearGradient>
                <linearGradient id="visorScreen" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#0f172a" />
                  <stop offset="100%" stopColor="#020617" />
                </linearGradient>
                <filter id="cyanGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3.5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Orbital Trajectory Rings */}
              <g opacity="0.45" stroke="#94a3b8" strokeWidth="1.2">
                <ellipse cx="120" cy="120" rx="105" ry="42" transform="rotate(-25 120 120)" />
                <ellipse cx="120" cy="120" rx="98" ry="48" transform="rotate(35 120 120)" />
                <ellipse cx="120" cy="120" rx="88" ry="70" transform="rotate(80 120 120)" />
              </g>

              {/* Orbital Doodles (Rocket, Planet, Stars) */}
              <g opacity="0.7">
                {/* Tiny Rocket */}
                <g transform="translate(42, 58) rotate(-30)">
                  <path d="M0 -6 C3 -2 3 6 0 9 C-3 6 -3 -2 0 -6 Z" fill="#94a3b8" />
                  <circle cx="0" cy="1" r="1.5" fill="#38bdf8" />
                  <path d="M-3 5 L-5 9 L-2 8 Z" fill="#cbd5e1" />
                  <path d="M3 5 L5 9 L2 8 Z" fill="#cbd5e1" />
                </g>
                {/* Tiny Ringed Planet */}
                <g transform="translate(196, 75)">
                  <circle cx="0" cy="0" r="5" fill="#cbd5e1" />
                  <ellipse cx="0" cy="0" rx="8" ry="2.5" fill="none" stroke="#94a3b8" strokeWidth="1" transform="rotate(-20)" />
                </g>
                {/* Moon with crater */}
                <g transform="translate(25, 150)">
                  <circle cx="0" cy="0" r="4.5" fill="#cbd5e1" />
                  <circle cx="-1" cy="-1" r="1.2" fill="#94a3b8" />
                  <circle cx="1.5" cy="1.5" r="1" fill="#94a3b8" />
                </g>
                {/* Little orbit node */}
                <g transform="translate(155, 205)">
                  <circle cx="0" cy="0" r="4" fill="#38bdf8" />
                  <ellipse cx="0" cy="0" rx="6" ry="2" fill="none" stroke="#94a3b8" strokeWidth="0.8" />
                </g>
              </g>

              {/* Robot Floating Shadow */}
              <ellipse cx="120" cy="215" rx="36" ry="8" fill="#64748b" opacity="0.15" />

              {/* Cute Angled Antennas */}
              <g>
                {/* Left Antenna */}
                <path d="M85 60 L68 36" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
                <circle cx="68" cy="36" r="6" fill="#38bdf8" stroke="#0284c7" strokeWidth="1.5" />
                {/* Right Antenna */}
                <path d="M155 60 L172 36" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
                <circle cx="172" cy="36" r="6" fill="#38bdf8" stroke="#0284c7" strokeWidth="1.5" />
              </g>

              {/* Robot Head Outer Shell (Rounded white 3D pill) */}
              <rect
                x="62"
                y="52"
                width="116"
                height="88"
                rx="34"
                fill="url(#bodyGrad)"
                stroke="#cbd5e1"
                strokeWidth="3.5"
              />

              {/* Headphone Ear Bumpers */}
              <rect x="50" y="72" width="15" height="46" rx="7.5" fill="url(#cyanAccent)" stroke="#0284c7" strokeWidth="2" />
              <rect x="175" y="72" width="15" height="46" rx="7.5" fill="url(#cyanAccent)" stroke="#0284c7" strokeWidth="2" />
              <circle cx="57.5" cy="95" r="4" fill="#ffffff" opacity="0.7" />
              <circle cx="182.5" cy="95" r="4" fill="#ffffff" opacity="0.7" />

              {/* Curved Glossy Visor Screen */}
              <rect
                x="76"
                y="65"
                width="88"
                height="62"
                rx="18"
                fill="url(#visorScreen)"
                stroke={isSpeaking ? "#38bdf8" : "#334155"}
                strokeWidth="2.5"
                filter={isSpeaking ? "url(#cyanGlow)" : undefined}
              />

              {/* Visor Corner HUD Brackets [ ] as seen in user's image */}
              <g stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" opacity="0.85">
                {/* Top-Left */}
                <path d="M83 75 L83 71 L87 71" />
                {/* Bottom-Left */}
                <path d="M83 115 L83 119 L87 119" />
                {/* Top-Right */}
                <path d="M157 75 L157 71 L153 71" />
                {/* Bottom-Right */}
                <path d="M157 115 L157 119 L153 119" />
              </g>

              {/* LED Eyes (Glowing Cyan) */}
              {isSpeaking ? (
                <>
                  <circle cx="98" cy="95" r="10" fill="#22d3ee" filter="url(#cyanGlow)" />
                  <circle cx="142" cy="95" r="10" fill="#22d3ee" filter="url(#cyanGlow)" />
                  <circle cx="96" cy="93" r="3.5" fill="#ffffff" />
                  <circle cx="140" cy="93" r="3.5" fill="#ffffff" />
                  {/* Speaking equalizer waves mouth */}
                  <path
                    d="M110 114 Q120 120 130 114"
                    stroke="#22d3ee"
                    strokeWidth="3"
                    strokeLinecap="round"
                    fill="none"
                    filter="url(#cyanGlow)"
                  />
                </>
              ) : (
                <>
                  <circle cx="98" cy="95" r="9" fill="#38bdf8" filter="url(#cyanGlow)" />
                  <circle cx="142" cy="95" r="9" fill="#38bdf8" filter="url(#cyanGlow)" />
                  <circle cx="96" cy="93" r="3" fill="#ffffff" />
                  <circle cx="140" cy="93" r="3" fill="#ffffff" />
                  {/* Sweet smile */}
                  <path
                    d="M113 113 Q120 118 127 113"
                    stroke="#38bdf8"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    fill="none"
                  />
                </>
              )}

              {/* Chubby Torso & Floating Base */}
              <path
                d="M92 138 C80 148 76 168 84 185 C92 200 148 200 156 185 C164 168 160 148 148 138 Z"
                fill="url(#bodyGrad)"
                stroke="#cbd5e1"
                strokeWidth="3"
              />

              {/* Baby-Blue Bib / Collar Accent */}
              <path
                d="M90 142 C100 156 140 156 150 142 C154 154 148 174 136 180 C128 184 112 184 104 180 C92 174 86 154 90 142 Z"
                fill="url(#cyanAccent)"
                opacity="0.9"
              />

              {/* Glowing Chest Reactor Core */}
              <circle
                cx="120"
                cy="158"
                r="8"
                fill="#22d3ee"
                filter="url(#cyanGlow)"
                className={isSpeaking ? "animate-pulse" : ""}
              />
              <circle cx="120" cy="158" r="4" fill="#ffffff" />

              {/* Right Hand holding Checklist Clipboard */}
              <g transform="translate(40, 120) rotate(-10)">
                {/* Clipboard Base */}
                <rect x="0" y="0" width="38" height="52" rx="6" fill="#ffffff" stroke="#94a3b8" strokeWidth="2" />
                {/* Clipboard Clip */}
                <rect x="10" y="-4" width="18" height="7" rx="3" fill="#0284c7" />
                {/* Checkbox Rows */}
                <rect x="5" y="8" width="6" height="6" rx="2" fill="#38bdf8" />
                <path d="M6 11 L8 13 L11 9" stroke="#ffffff" strokeWidth="1.2" fill="none" />
                <line x1="14" y1="11" x2="33" y2="11" stroke="#0284c7" strokeWidth="2.5" strokeLinecap="round" />

                <rect x="5" y="18" width="6" height="6" rx="2" fill="#38bdf8" />
                <path d="M6 21 L8 23 L11 19" stroke="#ffffff" strokeWidth="1.2" fill="none" />
                <line x1="14" y1="21" x2="30" y2="21" stroke="#0284c7" strokeWidth="2.5" strokeLinecap="round" />

                <rect x="5" y="28" width="6" height="6" rx="2" fill="#38bdf8" />
                <path d="M6 31 L8 33 L11 29" stroke="#ffffff" strokeWidth="1.2" fill="none" />
                <line x1="14" y1="31" x2="32" y2="31" stroke="#0284c7" strokeWidth="2.5" strokeLinecap="round" />

                <line x1="14" y1="41" x2="28" y2="41" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
                {/* Hand Arm */}
                <circle cx="36" cy="38" r="6" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="2" />
              </g>

              {/* Left Hand holding Stylus Pen */}
              <g transform="translate(170, 115) rotate(15)">
                {/* Arm / Hand */}
                <circle cx="8" cy="24" r="7" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="2" />
                {/* Stylus Pen */}
                <g transform="translate(10, 10) rotate(-45)">
                  <rect x="-3" y="-12" width="6" height="24" rx="2" fill="#0f172a" />
                  <rect x="-3" y="-4" width="6" height="6" fill="#38bdf8" />
                  <path d="M-3 12 L0 18 L3 12 Z" fill="#94a3b8" />
                  <circle cx="0" cy="18" r="1.5" fill="#38bdf8" />
                </g>
              </g>
            </svg>
          </div>
        )}

        {/* Live Speaking Indicator Badge */}
        {isSpeaking && (
          <div className="absolute -top-2 -right-2 px-2.5 py-1 bg-blue-500 text-white font-extrabold text-xs rounded-full flex items-center gap-1 shadow-md animate-pulse ring-2 ring-blue-300">
            <Volume2 className="w-3.5 h-3.5" />
            <span>AZero nói</span>
          </div>
        )}
      </motion.div>

      {/* Robot Name & Badge */}
      {showBadge && (
        <div className="mt-2 text-center">
          <span className={`inline-block px-3 py-1 text-xs font-black rounded-full shadow-sm ${
            lightTheme
              ? 'bg-slate-100 border border-slate-300 text-slate-800'
              : 'bg-slate-900 border border-slate-700 text-cyan-300'
          }`}>
            {badgeLabel}
          </span>
        </div>
      )}

      {/* Embedded Speech Control Panel (Mini bar) */}
      {(onPlay || onPause || onReplay || onToggleMute) && (
        <div className="mt-2 flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1 rounded-xl shadow-sm">
          {isSpeaking ? (
            <button
              onClick={onPause}
              title="Tạm dừng"
              className="p-1 hover:bg-blue-50 text-blue-600 rounded-lg transition"
            >
              <Pause className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={onPlay}
              title="Phát giọng đọc"
              className="p-1 hover:bg-blue-50 text-green-600 rounded-lg transition"
            >
              <Play className="w-3.5 h-3.5" />
            </button>
          )}

          {onReplay && (
            <button
              onClick={onReplay}
              title="Đọc lại"
              className="p-1 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-lg transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          {onToggleMute && (
            <button
              onClick={onToggleMute}
              title={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
              className={`p-1 hover:bg-slate-100 rounded-lg transition ${
                isMuted ? 'text-red-500' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
