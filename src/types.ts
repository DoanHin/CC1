export interface Question {
  id: number;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation?: string;
  audioUrl?: string;
}

export interface GameContentConfig {
  welcomeGreetingText: string;
  rulesIntroText: string;
  questions: Question[];
  tieBreakerQuestion: Question;
  defaultTeam1Name: string;
  defaultTeam2Name: string;
  azeroImageUrl?: string;
  greetingAudioUrl?: string;
  correctSoundUrl?: string;
  wrongSoundUrl?: string;
  victorySoundUrl?: string;
  backgroundMusicUrl?: string;
}

export type GamePhase =
  | 'welcome'
  | 'greeting_speech'
  | 'team_setup'
  | 'playing'
  | 'question_active'
  | 'question_evaluated'
  | 'tie_breaker'
  | 'victory';

export interface GameHistoryState {
  team1Score: number;
  team2Score: number;
  activeTeam: 1 | 2;
  openedQuestions: number[];
  lastQuestionId: number | null;
  lastActionSummary: string;
}
