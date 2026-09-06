import React from 'react';
import {
  Maximize, Minimize, Volume2, VolumeX, RotateCcw,
  Undo2, Settings, HelpCircle, AlertTriangle
} from 'lucide-react';

interface ControlBarProps {
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onUndo: () => void;
  canUndo: boolean;
  onRestart: () => void;
  onOpenContentManager: () => void;
}

export const ControlBar: React.FC<ControlBarProps> = ({
  isFullscreen,
  onToggleFullscreen,
  isMuted,
  onToggleMute,
  onUndo,
  canUndo,
  onRestart,
  onOpenContentManager,
}) => {
  return (
    <div className="w-full flex items-center justify-between px-6 py-2 bg-slate-900 border-t-2 border-slate-800 text-xs text-slate-400 font-bold uppercase tracking-[0.1em] select-none">
      {/* School / Program Title */}
      <div className="flex items-center gap-2.5">
        <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center text-white font-black text-xs shadow">A0</div>
        <span className="font-extrabold text-slate-200">
          THPT TÔ HIỆU • LỚP 11A0
        </span>
      </div>

      {/* Main control action buttons */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Undo (Hoàn tác) */}
        <button
          onClick={onUndo}
          disabled={!canUndo}
          title="Hoàn tác thao tác Đúng/Sai vừa bấm"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition text-xs uppercase tracking-wider ${
            canUndo
              ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-white border border-amber-500/40 shadow-sm'
              : 'bg-slate-900/60 text-slate-600 border border-slate-800 cursor-not-allowed'
          }`}
        >
          <Undo2 className="w-4 h-4" />
          <span className="hidden sm:inline">HOÀN TÁC</span>
        </button>

        {/* Sound toggle (Bật/Tắt âm thanh) */}
        <button
          onClick={onToggleMute}
          title={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition border text-xs uppercase tracking-wider ${
            isMuted
              ? 'bg-red-950/60 border-red-500/40 text-red-300'
              : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
          }`}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          <span className="hidden sm:inline">{isMuted ? 'ĐÃ TẮT ÂM' : 'ÂM THANH'}</span>
        </button>

        {/* Fullscreen (Toàn màn hình) */}
        <button
          onClick={onToggleFullscreen}
          title="Bật/Tắt chế độ trình chiếu toàn màn hình"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white font-bold transition shadow-sm text-xs uppercase tracking-wider"
        >
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          <span className="hidden sm:inline">TOÀN MÀN HÌNH</span>
        </button>

        {/* Restart (Bắt đầu lại) */}
        <button
          onClick={onRestart}
          title="Bắt đầu lại trận đấu mới"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-red-900/60 border border-slate-700 hover:border-red-500/40 text-slate-300 hover:text-red-200 font-bold transition shadow-sm text-xs uppercase tracking-wider"
        >
          <RotateCcw className="w-4 h-4" />
          <span className="hidden sm:inline">BẮT ĐẦU LẠI</span>
        </button>

        {/* Admin content manager (Quản lý nội dung) */}
        <button
          onClick={onOpenContentManager}
          title="Trang quản lý nội dung câu hỏi và âm thanh"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-900/80 hover:bg-blue-800 border border-blue-500/50 text-blue-200 font-bold transition shadow-sm text-xs uppercase tracking-wider"
        >
          <Settings className="w-4 h-4" />
          <span className="hidden md:inline">QUẢN LÝ NỘI DUNG</span>
        </button>
      </div>
    </div>
  );
};
