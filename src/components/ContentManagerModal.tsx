import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import {
  X, Save, Play, CheckCircle, Upload, Plus, Trash2,
  FileAudio, Image, RefreshCw, HelpCircle, Lock, Unlock,
  Music, CheckCircle2, Pause
} from 'lucide-react';
import { GameContentConfig, Question } from '../types';
import { speechService } from '../services/speechAndSound';
import { saveGameConfigOnline } from '../services/firebase';

interface ContentManagerModalProps {
  config: GameContentConfig;
  onSave: (newConfig: GameContentConfig) => void;
  onClose: () => void;
}

export const ContentManagerModal: React.FC<ContentManagerModalProps> = ({
  config,
  onSave,
  onClose
}) => {
  const [formData, setFormData] = useState<GameContentConfig>(JSON.parse(JSON.stringify(config)));
  const [activeTab, setActiveTab] = useState<'questions' | 'script' | 'media' | 'general'>('questions');
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number>(0);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [playingAudioUrl, setPlayingAudioUrl] = useState<string | null>(null);
  const audioTestRef = useRef<HTMLAudioElement | null>(null);

  const currentQ = formData.questions[selectedQuestionIndex] || formData.questions[0];

  const handleUpdateQuestion = (field: keyof Question, value: unknown) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[selectedQuestionIndex] = {
      ...updatedQuestions[selectedQuestionIndex],
      [field]: value
    };
    setFormData({ ...formData, questions: updatedQuestions });
  };

  const handleUpdateOption = (key: 'A' | 'B' | 'C' | 'D', text: string) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[selectedQuestionIndex] = {
      ...updatedQuestions[selectedQuestionIndex],
      options: {
        ...updatedQuestions[selectedQuestionIndex].options,
        [key]: text
      }
    };
    setFormData({ ...formData, questions: updatedQuestions });
  };

  const handleUpdateTieBreaker = (field: keyof Question, value: unknown) => {
    setFormData({
      ...formData,
      tieBreakerQuestion: {
        ...formData.tieBreakerQuestion,
        [field]: value
      }
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus("Đang lưu và đồng bộ lên máy chủ...");

    try {
      await saveGameConfigOnline(formData);
      onSave(formData);
      setSaveStatus("Đã lưu và đồng bộ thành công! Các thiết bị khác sẽ tự động nhận nội dung mới nhất.");
    } catch (e) {
      setSaveStatus("Đã lưu vào bộ nhớ cục bộ.");
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveStatus(null), 4000);
    }
  };

  const testAudio = (url?: string) => {
    if (!url) return;
    if (playingAudioUrl === url && audioTestRef.current) {
      audioTestRef.current.pause();
      setPlayingAudioUrl(null);
      return;
    }

    if (audioTestRef.current) {
      audioTestRef.current.pause();
    }
    const audio = new Audio(url);
    audioTestRef.current = audio;
    audio.onended = () => setPlayingAudioUrl(null);
    audio.onerror = () => setPlayingAudioUrl(null);
    audio.play();
    setPlayingAudioUrl(url);
  };

  const handleQuestionAudioUpload = (e: React.ChangeEvent<HTMLInputElement>, isTieBreaker: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        if (isTieBreaker) {
          handleUpdateTieBreaker('audioUrl', dataUrl);
        } else {
          handleUpdateQuestion('audioUrl', dataUrl);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-5xl h-[92vh] bg-[#0c1427]/95 border-2 border-cyan-500/40 rounded-3xl shadow-[0_0_60px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden text-slate-100"
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div>
            <h2 className="text-xl font-black text-white tracking-tight uppercase flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
              TRUNG TÂM QUẢN TRỊ NỘI DUNG & FILE ÂM THANH
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              Tùy chỉnh 16 câu hỏi, file đọc âm thanh riêng từng câu và kịch bản AZero
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="btn-save-content-config"
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm rounded-xl flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.35)] transition cursor-pointer border border-emerald-300"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? "Đang lưu..." : "LƯU CẤU HÌNH"}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sync Status Banner */}
        {saveStatus && (
          <div className="px-6 py-2 bg-emerald-950/80 border-b border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{saveStatus}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950 px-6 gap-2 pt-2">
          {[
            { id: 'questions', label: '16 Câu hỏi & File đọc riêng' },
            { id: 'script', label: 'Lời dẫn & Kịch bản AZero' },
            { id: 'media', label: 'File âm thanh tổng & Ảnh' },
            { id: 'general', label: 'Cấu hình chung' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`py-2.5 px-4 font-black text-xs sm:text-sm border-b-2 transition cursor-pointer ${
                activeTab === tab.id
                  ? 'border-cyan-400 text-cyan-300 bg-cyan-950/40 rounded-t-xl'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#070b14]/90">
          {/* TAB 1: 16 QUESTIONS */}
          {activeTab === 'questions' && (
            <div className="flex flex-col md:flex-row gap-6 h-full">
              {/* Left Selector List */}
              <div className="w-full md:w-60 shrink-0 flex flex-col gap-1.5 max-h-[65vh] overflow-y-auto pr-1">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400 mb-1">
                  CHỌN CÂU HỎI
                </span>
                {formData.questions.map((q, idx) => (
                  <button
                    key={q.id}
                    onClick={() => setSelectedQuestionIndex(idx)}
                    className={`py-2 px-3 rounded-xl text-left font-bold text-xs sm:text-sm flex items-center justify-between transition cursor-pointer ${
                      selectedQuestionIndex === idx
                        ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
                        : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <span>Câu {q.id}</span>
                      {q.audioUrl && q.audioUrl.trim().length > 0 && (
                        <Music className="w-3 h-3 text-emerald-400 shrink-0" />
                      )}
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-black ${
                      selectedQuestionIndex === idx ? 'bg-slate-950 text-cyan-300' : 'bg-slate-950 text-cyan-400 border border-slate-800'
                    }`}>
                      Đ/A: {q.correctAnswer}
                    </span>
                  </button>
                ))}

                {/* Question tie breaker select */}
                <button
                  onClick={() => setSelectedQuestionIndex(999)}
                  className={`mt-2 py-2 px-3 rounded-xl text-left font-black text-xs sm:text-sm flex items-center justify-between transition cursor-pointer ${
                    selectedQuestionIndex === 999
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'bg-amber-950/40 border border-amber-500/40 text-amber-300 hover:bg-amber-900/40'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span>Câu hỏi phụ</span>
                    {formData.tieBreakerQuestion.audioUrl && (
                      <Music className="w-3 h-3 text-emerald-400" />
                    )}
                  </div>
                  <span className="text-[10px] font-black">PHỤ</span>
                </button>
              </div>

              {/* Right Edit Form */}
              <div className="flex-1 bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-4 shadow-sm">
                {selectedQuestionIndex === 999 ? (
                  /* Tie Breaker Editor */
                  <>
                    <h3 className="text-lg font-black text-amber-400 uppercase">
                      CHỈNH SỬA CÂU HỎI PHỤ QUYẾT ĐỊNH
                    </h3>
                    <div>
                      <label className="block text-xs font-black uppercase text-slate-400 mb-1">
                        Nội dung câu hỏi phụ:
                      </label>
                      <textarea
                        rows={3}
                        value={formData.tieBreakerQuestion.question}
                        onChange={(e) => handleUpdateTieBreaker('question', e.target.value)}
                        className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-medium focus:border-amber-400 focus:outline-none"
                      />
                    </div>

                    {/* Options */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(['A', 'B', 'C', 'D'] as const).map((key) => (
                        <div key={key} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                          <label className="block text-xs font-black text-amber-400 mb-1">
                            Phương án {key}:
                          </label>
                          <input
                            type="text"
                            value={formData.tieBreakerQuestion.options[key]}
                            onChange={(e) => {
                              const updatedOptions = {
                                ...formData.tieBreakerQuestion.options,
                                [key]: e.target.value
                              };
                              handleUpdateTieBreaker('options', updatedOptions);
                            }}
                            className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-medium focus:border-amber-400 focus:outline-none"
                          />
                        </div>
                      ))}
                    </div>

                    {/* Tie breaker Audio uploader */}
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-black uppercase text-cyan-300 flex items-center gap-1.5">
                          <Music className="w-3.5 h-3.5 text-cyan-400" />
                          File ghi âm đọc câu hỏi phụ:
                        </label>
                        <label className="px-3 py-1 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 font-bold text-xs cursor-pointer flex items-center gap-1.5 transition">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Tải file âm thanh (.mp3, .wav)</span>
                          <input
                            type="file"
                            accept="audio/*"
                            className="hidden"
                            onChange={(e) => handleQuestionAudioUpload(e, true)}
                          />
                        </label>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Hoặc dán URL file âm thanh..."
                          value={formData.tieBreakerQuestion.audioUrl || ''}
                          onChange={(e) => handleUpdateTieBreaker('audioUrl', e.target.value)}
                          className="flex-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 text-xs font-mono focus:border-cyan-400 focus:outline-none"
                        />
                        {formData.tieBreakerQuestion.audioUrl && (
                          <>
                            <button
                              type="button"
                              onClick={() => testAudio(formData.tieBreakerQuestion.audioUrl)}
                              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs flex items-center gap-1 border border-slate-700 cursor-pointer"
                            >
                              <Play className="w-3.5 h-3.5" />
                              Nghe
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateTieBreaker('audioUrl', '')}
                              className="p-2 rounded-lg bg-slate-800 hover:bg-red-950 text-slate-400 hover:text-red-400 border border-slate-700 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  /* Standard Question Editor */
                  <>
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-black text-cyan-400 uppercase">
                        CÂU HỎI SỐ {currentQ.id}
                      </h3>
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-black text-slate-300">Đáp án đúng:</label>
                        <select
                          value={currentQ.correctAnswer}
                          onChange={(e) => handleUpdateQuestion('correctAnswer', e.target.value)}
                          className="px-3 py-1 bg-slate-950 border border-cyan-500/50 text-cyan-300 font-black rounded-lg focus:outline-none"
                        >
                          <option value="A">A</option>
                          <option value="B">B</option>
                          <option value="C">C</option>
                          <option value="D">D</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-black uppercase text-slate-400 mb-1">
                        Nội dung câu hỏi:
                      </label>
                      <textarea
                        rows={3}
                        value={currentQ.question}
                        onChange={(e) => handleUpdateQuestion('question', e.target.value)}
                        className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold focus:border-cyan-400 focus:outline-none"
                      />
                    </div>

                    {/* 4 Options */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(['A', 'B', 'C', 'D'] as const).map((key) => (
                        <div key={key} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                          <label className="block text-xs font-black text-cyan-400 mb-1">
                            Phương án {key}:
                          </label>
                          <input
                            type="text"
                            value={currentQ.options[key]}
                            onChange={(e) => handleUpdateOption(key, e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-medium focus:border-cyan-400 focus:outline-none"
                          />
                        </div>
                      ))}
                    </div>

                    {/* DEDICATED QUESTION AUDIO UPLOADER */}
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-black uppercase text-cyan-300 flex items-center gap-1.5">
                          <Music className="w-3.5 h-3.5 text-cyan-400" />
                          File ghi âm đọc câu hỏi số {currentQ.id}:
                        </label>
                        <label className="px-3 py-1 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 font-bold text-xs cursor-pointer flex items-center gap-1.5 transition">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Tải file âm thanh câu {currentQ.id} (.mp3, .wav)</span>
                          <input
                            type="file"
                            accept="audio/*"
                            className="hidden"
                            onChange={(e) => handleQuestionAudioUpload(e, false)}
                          />
                        </label>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Hoặc dán URL file âm thanh đọc câu này..."
                          value={currentQ.audioUrl || ''}
                          onChange={(e) => handleUpdateQuestion('audioUrl', e.target.value)}
                          className="flex-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 text-xs font-mono focus:border-cyan-400 focus:outline-none"
                        />
                        {currentQ.audioUrl && (
                          <>
                            <button
                              type="button"
                              onClick={() => testAudio(currentQ.audioUrl)}
                              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs flex items-center gap-1 border border-slate-700 cursor-pointer"
                            >
                              <Play className="w-3.5 h-3.5" />
                              Nghe
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateQuestion('audioUrl', '')}
                              className="p-2 rounded-lg bg-slate-800 hover:bg-red-950 text-slate-400 hover:text-red-400 border border-slate-700 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                      {currentQ.audioUrl ? (
                        <div className="mt-1.5 text-[11px] text-emerald-400 font-semibold flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Câu hỏi này sẽ phát bằng file ghi âm riêng khi mở</span>
                        </div>
                      ) : (
                        <div className="mt-1.5 text-[11px] text-slate-500">
                          (Chưa có file ghi âm riêng - Hệ thống sẽ đọc bằng giọng đọc AI AZero)
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: SCRIPT & GREETING */}
          {activeTab === 'script' && (
            <div className="space-y-4 max-w-3xl mx-auto">
              <div>
                <label className="block text-xs font-black uppercase text-cyan-400 mb-1.5">
                  Kịch bản âm thanh lời chào của Robot AZero:
                </label>
                <textarea
                  rows={12}
                  value={formData.welcomeGreetingText}
                  onChange={(e) => setFormData({ ...formData, welcomeGreetingText: e.target.value })}
                  className="w-full p-4 rounded-2xl bg-slate-900 border border-slate-700 text-white font-sans leading-relaxed focus:border-cyan-400 focus:outline-none shadow-sm"
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => speechService.speakTextChunks(formData.welcomeGreetingText, { rate: 0.9, pitch: 1.05 })}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-sm rounded-xl flex items-center gap-2 shadow-sm transition cursor-pointer"
                >
                  <Play className="w-4 h-4" />
                  Nghe thử giọng đọc AZero
                </button>
                <button
                  type="button"
                  onClick={() => speechService.stop()}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-rose-400 font-bold text-sm rounded-xl border border-slate-700 cursor-pointer"
                >
                  Dừng
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: MEDIA & SOUNDS */}
          {activeTab === 'media' && (
            <div className="space-y-4 max-w-3xl mx-auto">
              {/* AZero image */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-black uppercase text-cyan-300">
                    Ảnh đại diện Robot AZero:
                  </label>
                  <label className="px-3 py-1 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 font-bold text-xs cursor-pointer transition">
                    <span>📁 Tải ảnh từ máy tính</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          setFormData({ ...formData, azeroImageUrl: ev.target?.result as string });
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                  </label>
                </div>
                <input
                  type="text"
                  placeholder="https://... đường dẫn hình ảnh robot AZero"
                  value={formData.azeroImageUrl || ''}
                  onChange={(e) => setFormData({ ...formData, azeroImageUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-sm focus:border-cyan-400 focus:outline-none"
                />
              </div>

              {/* Greeting audio */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-black uppercase text-cyan-300">
                    File ghi âm lời chào AZero:
                  </label>
                  <label className="px-3 py-1 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 font-bold text-xs cursor-pointer transition">
                    <span>📁 Tải file âm thanh (.mp3, .wav)</span>
                    <input
                      type="file"
                      accept="audio/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          setFormData({ ...formData, greetingAudioUrl: ev.target?.result as string });
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                  </label>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="https://... hoặc tải file âm thanh lên"
                    value={formData.greetingAudioUrl || ''}
                    onChange={(e) => setFormData({ ...formData, greetingAudioUrl: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-sm focus:border-cyan-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => testAudio(formData.greetingAudioUrl)}
                    className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs flex items-center gap-1 border border-slate-700 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5" />
                    Thử
                  </button>
                </div>
              </div>

              {/* Correct sound */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
                <label className="block text-xs font-black uppercase text-emerald-400 mb-1">
                  Âm thanh báo ĐÚNG (URL):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Để trống để dùng âm thanh chimes tích hợp"
                    value={formData.correctSoundUrl || ''}
                    onChange={(e) => setFormData({ ...formData, correctSoundUrl: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-sm focus:border-emerald-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => speechService.playCorrectSound(formData.correctSoundUrl)}
                    className="px-3 py-2 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 font-bold text-xs flex items-center gap-1 border border-emerald-500/40 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5" />
                    Thử
                  </button>
                </div>
              </div>

              {/* Wrong sound */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
                <label className="block text-xs font-black uppercase text-rose-400 mb-1">
                  Âm thanh báo SAI (URL):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Để trống để dùng âm thanh trầm nhẹ tích hợp"
                    value={formData.wrongSoundUrl || ''}
                    onChange={(e) => setFormData({ ...formData, wrongSoundUrl: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-sm focus:border-rose-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => speechService.playWrongSound(formData.wrongSoundUrl)}
                    className="px-3 py-2 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300 font-bold text-xs flex items-center gap-1 border border-rose-500/40 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5" />
                    Thử
                  </button>
                </div>
              </div>

              {/* Victory sound */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
                <label className="block text-xs font-black uppercase text-amber-400 mb-1">
                  Nhạc chiến thắng (URL):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Để trống để dùng nhạc fanfare khải hoàn tích hợp"
                    value={formData.victorySoundUrl || ''}
                    onChange={(e) => setFormData({ ...formData, victorySoundUrl: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-sm focus:border-amber-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => speechService.playVictoryFanfare(formData.victorySoundUrl)}
                    className="px-3 py-2 rounded-lg bg-amber-950/80 hover:bg-amber-900 text-amber-300 font-bold text-xs flex items-center gap-1 border border-amber-500/40 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5" />
                    Thử
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: GENERAL CONFIG */}
          {activeTab === 'general' && (
            <div className="space-y-4 max-w-xl mx-auto">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
                <label className="block text-xs font-black uppercase text-cyan-400 mb-1">
                  Tên mặc định Đội 1:
                </label>
                <input
                  type="text"
                  value={formData.defaultTeam1Name}
                  onChange={(e) => setFormData({ ...formData, defaultTeam1Name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-base font-bold focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
                <label className="block text-xs font-black uppercase text-rose-400 mb-1">
                  Tên mặc định Đội 2:
                </label>
                <input
                  type="text"
                  value={formData.defaultTeam2Name}
                  onChange={(e) => setFormData({ ...formData, defaultTeam2Name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-base font-bold focus:border-rose-400 focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
