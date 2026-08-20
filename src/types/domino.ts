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
  orientation: 'horizontal' | 'vertical';
  displayTop: number;
  displayBottom: number;
  matchingEndVal: number;
}

export interface PlayerProfile {
  id: string;
  displayName: string;
  avatar: string;
  wins: number;
  losses: number;
  gamesPlayed: number;
  createdAt: string;
}

export interface Player {
  id: string;
  name: string;
  nameAr: string;
  hand: Tile[];
  isBot: boolean;
  team: 1 | 2 | 3 | 4 | 5 | 6;
  avatar: string;
  score: number;
  isPassed?: boolean;
  isConnected?: boolean;
  profileId?: string;
}

export type GameMode = '1v1' | '3_ffa' | '2v2' | '4_ffa' | '5_ffa' | '6_ffa' | '3v3' | 'pass_play' | 'online';
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
  onlineSubMode?: '1v1' | '3_ffa' | '2v2' | '4_ffa' | '5_ffa' | '6_ffa' | '3v3';
  targetScore: number;
  players: Player[];
  currentTurnIndex: number;
  board: GameBoard;
  boneyard: Tile[];
  status: 'lobby' | 'profile' | 'waiting' | 'playing' | 'round_ended' | 'match_ended';
  roundNumber: number;
  openingPlayerIndex: number;
  firstTilePlayed: boolean;
  lastActionMessage: { ar: string; en: string } | null;
  chatMessages: ChatMessage[];
  roundWinner: {
    playerIds: string[];
    team?: number;
    reason: 'domino' | 'blocked';
    points: number;
    pipCounts: { [playerId: string]: number };
  } | null;
  matchWinner: {
    team?: number;
    player?: Player;
  } | null;
}
