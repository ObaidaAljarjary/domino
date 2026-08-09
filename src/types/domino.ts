export interface Tile {
  id: string;
  top: number;
  bottom: number;
}

export type PlayPosition = 'left' | 'right' | 'first';

export interface PlayedTile {
  tile: Tile;
  isDouble: boolean;
  position: PlayPosition;
  // Orientation relative to line of play: 'horizontal' or 'vertical'
  orientation: 'horizontal' | 'vertical';
  // Matching end values
  matchingEndVal: number;
}

export interface Player {
  id: string;
  name: string;
  nameAr: string;
  hand: Tile[];
  isBot: boolean;
  team: 1 | 2; // Team 1: Player 0 & Player 2, Team 2: Player 1 & Player 3
  avatar: string;
  score: number;
  isPassed?: boolean;
}

export type GameMode = '1v1' | '2v2' | 'pass_play' | 'online';
export type Language = 'ar' | 'en';

export interface GameBoard {
  tiles: PlayedTile[];
  leftEnd: number | null;
  rightEnd: number | null;
}

export interface ChatMessage {
  id: string;
  sender: string;
  senderAr: string;
  text: string;
  textAr: string;
  time: string;
  isBot?: boolean;
}

export interface GameState {
  mode: GameMode;
  targetScore: number;
  players: Player[];
  currentTurnIndex: number;
  board: GameBoard;
  boneyard: Tile[];
  status: 'lobby' | 'playing' | 'round_ended' | 'match_ended';
  roundNumber: number;
  openingPlayerIndex: number;
  firstTilePlayed: boolean;
  lastActionMessage: { ar: string; en: string } | null;
  chatMessages: ChatMessage[];
  roundWinner: {
    playerIds: string[];
    team?: 1 | 2;
    reason: 'domino' | 'blocked';
    points: number;
    pipCounts: { [playerId: string]: number };
  } | null;
  matchWinner: {
    team?: 1 | 2;
    player?: Player;
  } | null;
}
