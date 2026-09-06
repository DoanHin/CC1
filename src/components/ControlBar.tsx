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
    <div className="w-full flex items-center justify-between px-6 py-2 bg-white border-t border-slate-200 text-xs text-slate-600 font-bold uppercase tracking-[0.05em] select-none shadow-sm">
      {/* School / Program Title */}
      <div className="flex items-center gap-2.5">
        <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center text-white font-black text-xs shadow-sm">A0</div>
        <span className="font-extrabold text-slate-800">
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
              ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-400 shadow-sm cursor-pointer'
              : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
          }`}
        >
          <Undo2 className="w-4 h-4" />
          <span className="hidden sm:inline">HOÀN TÁC</span>
        </button>

        {/* Sound toggle (Bật/Tắt âm thanh) */}
        <button
          onClick={onToggleMute}
          title={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition border text-xs uppercase tracking-wider cursor-pointer ${
            isMuted
              ? 'bg-red-50 border-red-300 text-red-700'
              : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
          }`}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          <span className="hidden sm:inline">{isMuted ? 'ĐÃ TẮT ÂM' : 'ÂM THANH'}</span>
        </button>

        {/* Fullscreen (Toàn màn hình) */}
        <button
          onClick={onToggleFullscreen}
          title="Bật/Tắt chế độ trình chiếu toàn màn hình"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 hover:text-slate-900 font-bold transition shadow-sm text-xs uppercase tracking-wider cursor-pointer"
        >
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          <span className="hidden sm:inline">TOÀN MÀN HÌNH</span>
        </button>

        {/* Restart (Bắt đầu lại) */}
        <button
          onClick={onRestart}
          title="Bắt đầu lại trận đấu mới"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-red-50 border border-slate-300 hover:border-red-300 text-slate-700 hover:text-red-700 font-bold transition shadow-sm text-xs uppercase tracking-wider cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span className="hidden sm:inline">BẮT ĐẦU LẠI</span>
        </button>

        {/* Admin content manager (Quản lý nội dung) */}
        <button
          onClick={onOpenContentManager}
          title="Trang quản lý nội dung câu hỏi và âm thanh"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-bold transition shadow-sm text-xs uppercase tracking-wider cursor-pointer"
        >
          <Settings className="w-4 h-4" />
          <span className="hidden md:inline">QUẢN LÝ NỘI DUNG</span>
        </button>
      </div>
    </div>
  );
};
