import React, { useState, useEffect } from 'react';
import { GameContentConfig, GamePhase, GameHistoryState, Question } from './types';
import { DEFAULT_GAME_CONFIG } from './data/defaultData';
import { loadGameConfig, saveGameConfigOnline } from './services/firebase';
import { speechService } from './services/speechAndSound';
import { WelcomeScreen } from './components/WelcomeScreen';
import { TeamSetupModal } from './components/TeamSetupModal';
import { TugOfWarArena } from './components/TugOfWarArena';
import { QuestionGrid } from './components/QuestionGrid';
import { QuestionModal } from './components/QuestionModal';
import { TieBreakerModal } from './components/TieBreakerModal';
import { VictoryScreen } from './components/VictoryScreen';
import { ContentManagerModal } from './components/ContentManagerModal';
import { ControlBar } from './components/ControlBar';
import { AZeroMascot } from './components/AZeroMascot';
import { AlertTriangle } from 'lucide-react';

export default function App() {
  // Game Configuration loaded from Firestore / LocalStorage
  const [gameConfig, setGameConfig] = useState<GameContentConfig>(DEFAULT_GAME_CONFIG);
  const [phase, setPhase] = useState<GamePhase>('welcome');

  // Match State (Session-only, not persisted across different client devices)
  const [team1Name, setTeam1Name] = useState<string>('Đội Xanh');
  const [team2Name, setTeam2Name] = useState<string>('Đội Đỏ');
  const [team1Score, setTeam1Score] = useState<number>(0);
  const [team2Score, setTeam2Score] = useState<number>(0);
  const [activeTeam, setActiveTeam] = useState<1 | 2>(1);
  const [openedQuestions, setOpenedQuestions] = useState<number[]>([]);
  const [currentQuestionId, setCurrentQuestionId] = useState<number | null>(null);

  // Tug animation state
  const [lastScoringTeam, setLastScoringTeam] = useState<1 | 2 | null>(null);
  const [isPullingAnim, setIsPullingAnim] = useState<boolean>(false);

  // Winner state
  const [winnerTeam, setWinnerTeam] = useState<1 | 2 | null>(null);

  // History stack for Undo (Hoàn tác)
  const [historyStack, setHistoryStack] = useState<GameHistoryState[]>([]);

  // UI state
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showContentManager, setShowContentManager] = useState<boolean>(false);
  const [showRestartConfirm, setShowRestartConfirm] = useState<boolean>(false);

  // AZero corner status message in arena
  const [azeroCornerChunk, setAzeroCornerChunk] = useState<string>('');

  // 1. Initial configuration load from Firestore
  useEffect(() => {
    loadGameConfig().then((loaded) => {
      setGameConfig(loaded);
      setTeam1Name(loaded.defaultTeam1Name || 'Đội Xanh');
      setTeam2Name(loaded.defaultTeam2Name || 'Đội Đỏ');
    });
  }, []);

  // 2. Fullscreen event listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn("Fullscreen request error:", err);
      });
    } else {
      document.exitFullscreen().catch((err) => {
        console.warn("Exit fullscreen error:", err);
      });
    }
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    speechService.setMuted(nextMuted);
  };

  // Start game flow: Welcome -> Team Setup
  const handleStartSetup = () => {
    setPhase('team_setup');
  };

  // Team Setup Confirmed -> Start Playing Arena
  const handleConfirmTeams = (t1: string, t2: string, firstTeam: 1 | 2) => {
    setTeam1Name(t1);
    setTeam2Name(t2);
    setActiveTeam(firstTeam);
    setTeam1Score(0);
    setTeam2Score(0);
    setOpenedQuestions([]);
    setHistoryStack([]);
    setPhase('playing');

    // AZero announces the first turn
    const firstTeamName = firstTeam === 1 ? t1 : t2;
    speechService.speakTextChunks(
      `Trận đấu chính thức bắt đầu! Xin mời ${firstTeamName} lựa chọn câu hỏi đầu tiên!`,
      {
        rate: 0.9,
        pitch: 1.05,
        onChunkChange: (chunk) => setAzeroCornerChunk(chunk)
      }
    );
  };

  // Select a question from 16-card grid
  const handleSelectQuestion = (qId: number) => {
    speechService.stop();
    setCurrentQuestionId(qId);
    setPhase('question_active');
  };

  // Evaluate result (ĐÚNG or SAI)
  const handleEvaluateResult = (isCorrect: boolean) => {
    // Save previous state to history stack for Undo
    setHistoryStack((prev) => [
      ...prev,
      {
        team1Score,
        team2Score,
        activeTeam,
        openedQuestions: [...openedQuestions],
        lastQuestionId: currentQuestionId,
        lastActionSummary: isCorrect
          ? `${activeTeam === 1 ? team1Name : team2Name} trả lời đúng câu ${currentQuestionId}`
          : `${activeTeam === 1 ? team1Name : team2Name} trả lời sai câu ${currentQuestionId}`
      }
    ]);

    if (isCorrect) {
      if (activeTeam === 1) {
        setTeam1Score((prev) => prev + 1);
        setLastScoringTeam(1);
      } else {
        setTeam2Score((prev) => prev + 1);
        setLastScoringTeam(2);
      }

      // Trigger pulling animation and exertion sound
      setIsPullingAnim(true);
      speechService.playTugPullSound();
      setTimeout(() => {
        setIsPullingAnim(false);
      }, 1200);
    }
  };

  // Close question modal and return to board
  const handleCloseQuestionModal = () => {
    speechService.stop();
    if (currentQuestionId !== null && !openedQuestions.includes(currentQuestionId)) {
      const nextOpened = [...openedQuestions, currentQuestionId];
      setOpenedQuestions(nextOpened);

      // Check if all 16 questions are completed
      if (nextOpened.length >= 16) {
        if (team1Score === team2Score) {
          // Tie breaker needed!
          setPhase('tie_breaker');
          speechService.speakTextChunks(
            "Thật bất ngờ! Sau 16 câu hỏi, hai đội đang có số câu trả lời đúng bằng nhau. Chúng ta sẽ cần một câu hỏi phụ để tìm ra đội chiến thắng chung cuộc!",
            { rate: 0.9, pitch: 1.05 }
          );
        } else {
          // Declare winner
          const finalWinner = team1Score > team2Score ? 1 : 2;
          setWinnerTeam(finalWinner);
          setPhase('victory');
        }
        setCurrentQuestionId(null);
        return;
      }
    }

    // Switch turn to other team
    const nextTeam = activeTeam === 1 ? 2 : 1;
    setActiveTeam(nextTeam);
    setCurrentQuestionId(null);
    setPhase('playing');

    const nextTeamName = nextTeam === 1 ? team1Name : team2Name;
    setTimeout(() => {
      speechService.speakTextChunks(`Xin mời ${nextTeamName} lựa chọn câu hỏi tiếp theo!`, {
        rate: 0.9,
        pitch: 1.05,
        onChunkChange: (c) => setAzeroCornerChunk(c)
      });
    }, 400);
  };

  // Undo (Hoàn tác)
  const handleUndo = () => {
    if (historyStack.length === 0) return;
    const lastState = historyStack[historyStack.length - 1];
    setHistoryStack((prev) => prev.slice(0, -1));

    setTeam1Score(lastState.team1Score);
    setTeam2Score(lastState.team2Score);
    setActiveTeam(lastState.activeTeam);
    setOpenedQuestions(lastState.openedQuestions);
    setPhase('playing');
    setCurrentQuestionId(null);
    speechService.stop();
  };

  // Tie-breaker win
  const handleTieBreakerWin = (winningTeam: 1 | 2) => {
    setWinnerTeam(winningTeam);
    setPhase('victory');
  };

  // Restart match
  const handleRestartConfirm = () => {
    speechService.stop();
    setTeam1Score(0);
    setTeam2Score(0);
    setOpenedQuestions([]);
    setCurrentQuestionId(null);
    setHistoryStack([]);
    setWinnerTeam(null);
    setShowRestartConfirm(false);
    setPhase('team_setup');
  };

  // Current active question
  const currentQuestion: Question | undefined =
    currentQuestionId !== null
      ? gameConfig.questions.find((q) => q.id === currentQuestionId)
      : undefined;

  // Update audio recording for a specific question
  const handleUpdateQuestionAudio = (questionId: number, audioUrl: string) => {
    const updatedQuestions = gameConfig.questions.map((q) =>
      q.id === questionId ? { ...q, audioUrl } : q
    );
    const updated = { ...gameConfig, questions: updatedQuestions };
    setGameConfig(updated);
    saveGameConfigOnline(updated);
  };

  return (
    <main className="w-full h-screen relative flex flex-col bg-[#070b14] font-sans select-none text-slate-100 overflow-hidden">
      {/* Top Header for Game Match (Cyber Modern Dark Header) */}
      {(phase === 'playing' || phase === 'question_active') && (
        <header className="h-14 sm:h-16 bg-[#0c1427]/90 backdrop-blur-md border-b border-cyan-500/30 flex items-center justify-between px-6 sm:px-8 shrink-0 z-10 shadow-[0_4px_20px_rgba(0,0,0,0.5)] text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center text-slate-950 font-black text-lg shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              A0
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white leading-none uppercase">
              KÉO CO <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">TRÍ TUỆ</span>
            </h1>
          </div>
          <div className="flex gap-3 items-center">
            <div className="px-3.5 py-1.5 bg-slate-900/90 rounded-full text-xs font-bold text-cyan-300 uppercase tracking-wider border border-cyan-500/30 shadow-sm">
              THPT TÔ HIỆU • LỚP 11A0
            </div>
          </div>
        </header>
      )}

      {/* 1. WELCOME SCREEN */}
      {phase === 'welcome' && (
        <WelcomeScreen
          greetingFullText={gameConfig.welcomeGreetingText}
          greetingAudioUrl={gameConfig.greetingAudioUrl}
          azeroImageUrl={gameConfig.azeroImageUrl}
          isMuted={isMuted}
          onToggleMute={toggleMute}
          onStartGame={handleStartSetup}
          onUpdateAudioUrl={(newAudioUrl) => {
            const updated = { ...gameConfig, greetingAudioUrl: newAudioUrl };
            setGameConfig(updated);
            saveGameConfigOnline(updated);
          }}
          onUpdateAzeroImage={(newImageUrl) => {
            const updated = { ...gameConfig, azeroImageUrl: newImageUrl };
            setGameConfig(updated);
            saveGameConfigOnline(updated);
          }}
          onOpenSettings={() => setShowContentManager(true)}
        />
      )}

      {/* 2. TEAM SETUP MODAL */}
      {phase === 'team_setup' && (
        <TeamSetupModal
          defaultTeam1={team1Name}
          defaultTeam2={team2Name}
          onConfirm={handleConfirmTeams}
        />
      )}

      {/* 3. MAIN ARENA & QUESTIONS (Fit tightly in 16:9 view without scroll) */}
      {(phase === 'playing' || phase === 'question_active') && (
        <div className="flex-1 flex flex-col justify-between overflow-hidden relative p-3 sm:p-4">
          {/* Top Tug Of War Arena */}
          <div className="h-[52%] w-full">
            <TugOfWarArena
              team1Name={team1Name}
              team2Name={team2Name}
              team1Score={team1Score}
              team2Score={team2Score}
              activeTeam={activeTeam}
              lastScoringTeam={lastScoringTeam}
              isPullingAnim={isPullingAnim}
            />
          </div>

          {/* Bottom Deck: 16-Question Grid & Compact AZero Supervisor (Dark Cyber Glass Card) */}
          <div className="h-[46%] w-full flex items-center justify-between gap-4 mt-2 bg-[#0c1427]/90 backdrop-blur-md rounded-2xl border border-slate-800 p-2 sm:p-3 shadow-xl">
            {/* AZero Corner Supervisor (Compact, placed on the left side) */}
            <div className="hidden md:flex flex-col items-center justify-center shrink-0 w-64 px-2">
              <AZeroMascot
                size="compact"
                isSpeaking={speechService.isSpeaking}
                isPaused={speechService.isPaused}
                isMuted={isMuted}
                currentChunkText={azeroCornerChunk}
                customImageUrl={gameConfig.azeroImageUrl}
                onPlay={() => speechService.resume()}
                onPause={() => speechService.pause()}
                onToggleMute={toggleMute}
                badgeLabel="AZero • Trọng tài AI"
                bubblePosition="top"
              />
            </div>

            {/* 16 Questions 4x4 Grid */}
            <div className="flex-1 flex items-center justify-center">
              <QuestionGrid
                openedQuestions={openedQuestions}
                onSelectQuestion={handleSelectQuestion}
                activeTeam={activeTeam}
                team1Name={team1Name}
                team2Name={team2Name}
              />
            </div>
          </div>
        </div>
      )}

      {/* 4. QUESTION MODAL (Overlay on top of arena) */}
      {phase === 'question_active' && currentQuestion && (
        <QuestionModal
          question={currentQuestion}
          activeTeam={activeTeam}
          team1Name={team1Name}
          team2Name={team2Name}
          onEvaluateResult={handleEvaluateResult}
          onCloseAndReturn={handleCloseQuestionModal}
          onUpdateQuestionAudio={handleUpdateQuestionAudio}
          correctSoundUrl={gameConfig.correctSoundUrl}
          wrongSoundUrl={gameConfig.wrongSoundUrl}
        />
      )}

      {/* 5. TIE BREAKER MODAL */}
      {phase === 'tie_breaker' && (
        <TieBreakerModal
          question={gameConfig.tieBreakerQuestion}
          team1Name={team1Name}
          team2Name={team2Name}
          onWin={handleTieBreakerWin}
          onCancel={() => setPhase('playing')}
          correctSoundUrl={gameConfig.correctSoundUrl}
          wrongSoundUrl={gameConfig.wrongSoundUrl}
        />
      )}

      {/* 6. VICTORY SCREEN */}
      {phase === 'victory' && winnerTeam && (
        <VictoryScreen
          team1Name={team1Name}
          team2Name={team2Name}
          team1Score={team1Score}
          team2Score={team2Score}
          winnerTeam={winnerTeam}
          onRestartGame={() => setShowRestartConfirm(true)}
          victorySoundUrl={gameConfig.victorySoundUrl}
          azeroImageUrl={gameConfig.azeroImageUrl}
          isMuted={isMuted}
          onToggleMute={toggleMute}
        />
      )}

      {/* 7. BOTTOM PERSISTENT CONTROL BAR */}
      <ControlBar
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        isMuted={isMuted}
        onToggleMute={toggleMute}
        onUndo={handleUndo}
        canUndo={historyStack.length > 0}
        onRestart={() => setShowRestartConfirm(true)}
        onOpenContentManager={() => setShowContentManager(true)}
      />

      {/* 8. CONTENT MANAGER MODAL */}
      {showContentManager && (
        <ContentManagerModal
          config={gameConfig}
          onSave={(newCfg) => setGameConfig(newCfg)}
          onClose={() => setShowContentManager(false)}
        />
      )}

      {/* 9. RESTART CONFIRMATION DIALOG */}
      {showRestartConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="bg-[#0c1427]/95 border-2 border-rose-500/50 rounded-3xl p-6 max-w-md w-full shadow-[0_0_50px_rgba(0,0,0,0.8)] text-center text-slate-100">
            <AlertTriangle className="w-12 h-12 text-rose-400 mx-auto mb-3 animate-bounce" />
            <h3 className="text-xl font-black text-white mb-2 uppercase">
              XÁC NHẬN BẮT ĐẦU LẠI?
            </h3>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed font-medium">
              Điểm số hiện tại của hai đội và các ô câu hỏi đã mở sẽ được xóa để bắt đầu một trận kéo co mới.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowRestartConfirm(false)}
                className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-sm border border-slate-700 transition cursor-pointer"
              >
                HỦY BỎ
              </button>
              <button
                onClick={handleRestartConfirm}
                className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black text-sm shadow-md transition cursor-pointer"
              >
                ĐỒNG Ý BẮT ĐẦU LẠI
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
