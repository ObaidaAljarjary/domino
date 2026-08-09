import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import type {
  GameState,
  GameMode,
  Language,
  Player,
  Tile as TileType,
  PlayPosition,
  PlayedTile,
} from './types/domino';
import {
  generateFullDeck,
  shuffleDeck,
  calculatePipCount,
  getValidMoves,
  findOpeningPlayerIndex,
  selectBotMove,
  isDoubleTile,
} from './utils/dominoRules';
import { soundEngine } from './utils/soundEngine';
import { TableComponent } from './components/Table';
import { HandComponent } from './components/Hand';
import { IstikanTeaComponent } from './components/IstikanTea';
import { ScoreBoardComponent } from './components/ScoreBoard';
import { BotBannerComponent } from './components/BotBanner';
import { LobbyComponent } from './components/Lobby';
import { Volume2, VolumeX, RotateCcw, Home, Sparkles } from 'lucide-react';
import './styles/chaikhana.css';

const BOT_DIALOGUES_PLAY = [
  { ar: 'دوش عراقي من البداية!', en: 'Classic Iraqi opening!' },
  { ar: 'العبها صح يا غالي!', en: 'Play it smart my friend!' },
  { ar: 'هذه القطعة راح تدوخك!', en: 'This tile will confuse you!' },
  { ar: 'شايخانة العمارية ما ترحم!', en: 'Chaikhana rules are tough!' },
];

const BOT_DIALOGUES_PASS = [
  { ar: 'باص! الخزنة ناشفة!', en: 'Pass! Boneyard is dry!' },
  { ar: 'ما عندي لعية.. مرر الدور!', en: 'No playable tiles.. pass!' },
];

export const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>('ar');
  const [soundMuted, setSoundMuted] = useState(false);
  const [selectedTile, setSelectedTile] = useState<TileType | null>(null);
  const [activeBotDialogue, setActiveBotDialogue] = useState<{
    botNameAr: string;
    botNameEn: string;
    avatar: string;
    messageAr: string;
    messageEn: string;
  } | null>(null);

  const [gameState, setGameState] = useState<GameState>({
    mode: '1v1',
    targetScore: 101,
    players: [],
    currentTurnIndex: 0,
    board: { tiles: [], leftEnd: null, rightEnd: null },
    boneyard: [],
    status: 'lobby',
    roundNumber: 1,
    openingPlayerIndex: 0,
    firstTilePlayed: false,
    lastActionMessage: null,
    chatMessages: [],
    roundWinner: null,
    matchWinner: null,
  });

  // Start New Game Match
  const startNewMatch = (
    mode: GameMode,
    playerName: string,
    targetScore: number
  ) => {
    let initialPlayers: Player[] = [];

    if (mode === '1v1') {
      initialPlayers = [
        {
          id: 'p0',
          name: playerName,
          nameAr: playerName,
          hand: [],
          isBot: false,
          team: 1,
          avatar: '🧔‍♂️',
          score: 0,
        },
        {
          id: 'p1',
          name: 'Abu Jasim',
          nameAr: 'أبو جاسم',
          hand: [],
          isBot: true,
          team: 2,
          avatar: '👳‍♂️',
          score: 0,
        },
      ];
    } else if (mode === '2v2') {
      initialPlayers = [
        {
          id: 'p0',
          name: playerName,
          nameAr: playerName,
          hand: [],
          isBot: false,
          team: 1,
          avatar: '🧔‍♂️',
          score: 0,
        },
        {
          id: 'p1',
          name: 'Abu Jasim',
          nameAr: 'أبو جاسم',
          hand: [],
          isBot: true,
          team: 2,
          avatar: '👳‍♂️',
          score: 0,
        },
        {
          id: 'p2',
          name: 'Hajji Raad',
          nameAr: 'الحجي أبو رعد',
          hand: [],
          isBot: true,
          team: 1, // Partner with Player 0
          avatar: '👴',
          score: 0,
        },
        {
          id: 'p3',
          name: 'Um Fahad',
          nameAr: 'أم فهد',
          hand: [],
          isBot: true,
          team: 2, // Partner with Abu Jasim
          avatar: '👵',
          score: 0,
        },
      ];
    } else {
      // Pass & Play
      initialPlayers = [
        {
          id: 'p0',
          name: `${playerName} 1`,
          nameAr: `${playerName} 1`,
          hand: [],
          isBot: false,
          team: 1,
          avatar: '🧔‍♂️',
          score: 0,
        },
        {
          id: 'p1',
          name: 'Player 2',
          nameAr: 'اللاعب 2',
          hand: [],
          isBot: false,
          team: 2,
          avatar: '👨‍🦱',
          score: 0,
        },
      ];
    }

    startNewRound(mode, initialPlayers, targetScore, 1);
  };

  // Start New Round
  const startNewRound = (
    mode: GameMode,
    playersList: Player[],
    targetScore: number,
    roundNum: number
  ) => {
    soundEngine.playTileShuffle();
    const fullDeck = shuffleDeck(generateFullDeck());

    const updatedPlayers = playersList.map((p) => ({
      ...p,
      hand: [] as TileType[],
      isPassed: false,
    }));

    let boneyard: TileType[] = [];

    // Deal 7 tiles to each player
    updatedPlayers.forEach((p, idx) => {
      p.hand = fullDeck.slice(idx * 7, (idx + 1) * 7);
    });

    if (mode === '1v1' || mode === 'pass_play') {
      boneyard = fullDeck.slice(14);
    } // in 2v2 all 28 tiles dealt (4 * 7)

    const openingInfo = findOpeningPlayerIndex(updatedPlayers);

    setGameState({
      mode,
      targetScore,
      players: updatedPlayers,
      currentTurnIndex: openingInfo.playerIndex,
      board: { tiles: [], leftEnd: null, rightEnd: null },
      boneyard,
      status: 'playing',
      roundNumber: roundNum,
      openingPlayerIndex: openingInfo.playerIndex,
      firstTilePlayed: false,
      lastActionMessage: {
        ar: `بدأت الجلسة! اللاعب ${updatedPlayers[openingInfo.playerIndex].nameAr} يبدأ.`,
        en: `Round started! Player ${updatedPlayers[openingInfo.playerIndex].name} opens.`,
      },
      chatMessages: [],
      roundWinner: null,
      matchWinner: null,
    });
  };

  const currentPlayer = gameState.players[gameState.currentTurnIndex];

  // Get valid moves for current player
  const validMoves = currentPlayer
    ? getValidMoves(
        currentPlayer.hand,
        gameState.board.leftEnd,
        gameState.board.rightEnd,
        !gameState.firstTilePlayed
      )
    : [];

  const playableTiles = Array.from(new Set(validMoves.map((m) => m.tile.id)))
    .map((id) => currentPlayer?.hand.find((t) => t.id === id))
    .filter(Boolean) as TileType[];

  // Execute playing a tile onto board
  const executePlayTile = (tile: TileType, position: PlayPosition) => {
    soundEngine.playTileSlam();

    const isDouble = isDoubleTile(tile);
    let newLeftEnd = gameState.board.leftEnd;
    let newRightEnd = gameState.board.rightEnd;

    if (newLeftEnd === null || newRightEnd === null) {
      // First tile on empty board
      newLeftEnd = tile.top;
      newRightEnd = tile.bottom;
    } else if (position === 'left') {
      newLeftEnd = tile.top === newLeftEnd ? tile.bottom : tile.top;
    } else if (position === 'right') {
      newRightEnd = tile.top === newRightEnd ? tile.bottom : tile.top;
    }

    const newPlayedTile: PlayedTile = {
      tile,
      isDouble,
      position,
      orientation: isDouble ? 'vertical' : 'horizontal',
      matchingEndVal: position === 'left' ? gameState.board.leftEnd || 0 : gameState.board.rightEnd || 0,
    };

    const newBoardTiles =
      position === 'left'
        ? [newPlayedTile, ...gameState.board.tiles]
        : [...gameState.board.tiles, newPlayedTile];

    // Remove tile from player hand
    const updatedPlayers = gameState.players.map((p, idx) => {
      if (idx === gameState.currentTurnIndex) {
        return {
          ...p,
          hand: p.hand.filter((t) => t.id !== tile.id),
          isPassed: false,
        };
      }
      return p;
    });

    const activeP = updatedPlayers[gameState.currentTurnIndex];

    // Check if player won round (Domino!)
    if (activeP.hand.length === 0) {
      handleRoundWin(activeP, 'domino', updatedPlayers);
      return;
    }

    // Advance turn to next player
    const nextTurnIndex = (gameState.currentTurnIndex + 1) % gameState.players.length;

    setGameState((prev) => ({
      ...prev,
      players: updatedPlayers,
      currentTurnIndex: nextTurnIndex,
      board: {
        tiles: newBoardTiles,
        leftEnd: newLeftEnd,
        rightEnd: newRightEnd,
      },
      firstTilePlayed: true,
      lastActionMessage: {
        ar: `لعب ${activeP.nameAr} قطعة [${tile.top}|${tile.bottom}]`,
        en: `${activeP.name} played tile [${tile.top}|${tile.bottom}]`,
      },
    }));

    setSelectedTile(null);
  };

  // Handle Player Drawing Tile from Boneyard
  const handleDrawTile = () => {
    if (gameState.boneyard.length === 0) return;

    soundEngine.playTileShuffle();
    const drawnTile = gameState.boneyard[0];
    const newBoneyard = gameState.boneyard.slice(1);

    const updatedPlayers = gameState.players.map((p, idx) => {
      if (idx === gameState.currentTurnIndex) {
        return { ...p, hand: [...p.hand, drawnTile] };
      }
      return p;
    });

    setGameState((prev) => ({
      ...prev,
      players: updatedPlayers,
      boneyard: newBoneyard,
      lastActionMessage: {
        ar: `سحب ${currentPlayer.nameAr} قطعة من الخزنة`,
        en: `${currentPlayer.name} drew a tile from boneyard`,
      },
    }));
  };

  // Handle Player Passing Turn
  const handlePassTurn = () => {
    soundEngine.playPassSound();

    const updatedPlayers = gameState.players.map((p, idx) => {
      if (idx === gameState.currentTurnIndex) {
        return { ...p, isPassed: true };
      }
      return p;
    });

    // Check if all players passed (Locked Board / القفلة)
    const allPassed = updatedPlayers.every((p) => p.isPassed || getValidMoves(p.hand, gameState.board.leftEnd, gameState.board.rightEnd).length === 0);

    if (allPassed && gameState.board.tiles.length > 0) {
      handleBlockedGame(updatedPlayers);
      return;
    }

    const nextTurnIndex = (gameState.currentTurnIndex + 1) % gameState.players.length;

    setGameState((prev) => ({
      ...prev,
      players: updatedPlayers,
      currentTurnIndex: nextTurnIndex,
      lastActionMessage: {
        ar: `مرر ${currentPlayer.nameAr} الدور (باص)`,
        en: `${currentPlayer.name} passed turn`,
      },
    }));
  };

  // Handle Round Win (Domino / تسكير)
  const handleRoundWin = (
    winnerPlayer: Player,
    reason: 'domino' | 'blocked',
    currentPlayers: Player[]
  ) => {
    soundEngine.playWinJingle();
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });

    let pointsGained = 0;
    const pipCounts: { [id: string]: number } = {};

    currentPlayers.forEach((p) => {
      pipCounts[p.id] = calculatePipCount(p.hand);
    });

    if (gameState.mode === '2v2') {
      const winningTeam = winnerPlayer.team;
      const opposingTeam = winningTeam === 1 ? 2 : 1;
      const oppPips = currentPlayers
        .filter((p) => p.team === opposingTeam)
        .reduce((sum, p) => sum + pipCounts[p.id], 0);

      pointsGained = oppPips;
    } else {
      // 1v1 or pass & play: sum of opponent remaining pips
      pointsGained = currentPlayers
        .filter((p) => p.id !== winnerPlayer.id)
        .reduce((sum, p) => sum + pipCounts[p.id], 0);
    }

    // Award points to winner / winning team
    const updatedPlayers = currentPlayers.map((p) => {
      if (
        (gameState.mode === '2v2' && p.team === winnerPlayer.team) ||
        p.id === winnerPlayer.id
      ) {
        return { ...p, score: p.score + pointsGained };
      }
      return p;
    });

    // Check if match won (target score reached)
    const matchWinnerPlayer = updatedPlayers.find(
      (p) => p.score >= gameState.targetScore
    );

    setGameState((prev) => ({
      ...prev,
      players: updatedPlayers,
      status: matchWinnerPlayer ? 'match_ended' : 'round_ended',
      roundWinner: {
        playerIds: [winnerPlayer.id],
        team: winnerPlayer.team,
        reason,
        points: pointsGained,
        pipCounts,
      },
      matchWinner: matchWinnerPlayer ? { player: matchWinnerPlayer } : null,
    }));
  };

  // Handle Blocked Game (القفلة / قفل)
  const handleBlockedGame = (currentPlayers: Player[]) => {
    soundEngine.playBlockSound();

    const pipCounts: { [id: string]: number } = {};
    currentPlayers.forEach((p) => {
      pipCounts[p.id] = calculatePipCount(p.hand);
    });

    let winningPlayer = currentPlayers[0];

    if (gameState.mode === '2v2') {
      const team1Pips = currentPlayers
        .filter((p) => p.team === 1)
        .reduce((sum, p) => sum + pipCounts[p.id], 0);
      const team2Pips = currentPlayers
        .filter((p) => p.team === 2)
        .reduce((sum, p) => sum + pipCounts[p.id], 0);

      winningPlayer = team1Pips <= team2Pips ? currentPlayers[0] : currentPlayers[1];
    } else {
      let minPips = Infinity;
      currentPlayers.forEach((p) => {
        if (pipCounts[p.id] < minPips) {
          minPips = pipCounts[p.id];
          winningPlayer = p;
        }
      });
    }

    handleRoundWin(winningPlayer, 'blocked', currentPlayers);
  };

  // Bot Turn Automation Effect
  useEffect(() => {
    if (gameState.status !== 'playing') return;
    if (!currentPlayer || !currentPlayer.isBot) return;

    const timer = setTimeout(() => {
      const botMove = selectBotMove(
        currentPlayer.hand,
        gameState.board.leftEnd,
        gameState.board.rightEnd,
        !gameState.firstTilePlayed
      );

      if (botMove) {
        // Trigger bot dialogue bubble
        const randDialogue =
          BOT_DIALOGUES_PLAY[Math.floor(Math.random() * BOT_DIALOGUES_PLAY.length)];
        setActiveBotDialogue({
          botNameAr: currentPlayer.nameAr,
          botNameEn: currentPlayer.name,
          avatar: currentPlayer.avatar,
          messageAr: randDialogue.ar,
          messageEn: randDialogue.en,
        });

        setTimeout(() => {
          setActiveBotDialogue(null);
        }, 2200);

        executePlayTile(botMove.tile, botMove.position);
      } else if (gameState.boneyard.length > 0) {
        handleDrawTile();
      } else {
        const randPass =
          BOT_DIALOGUES_PASS[Math.floor(Math.random() * BOT_DIALOGUES_PASS.length)];
        setActiveBotDialogue({
          botNameAr: currentPlayer.nameAr,
          botNameEn: currentPlayer.name,
          avatar: currentPlayer.avatar,
          messageAr: randPass.ar,
          messageEn: randPass.en,
        });

        setTimeout(() => {
          setActiveBotDialogue(null);
        }, 2000);

        handlePassTurn();
      }
    }, 900);

    return () => clearTimeout(timer);
  }, [gameState.currentTurnIndex, gameState.status, gameState.board]);

  const toggleSound = () => {
    soundEngine.soundEnabled = !soundMuted;
    setSoundMuted(!soundMuted);
  };

  return (
    <div className="chaikhana-app">
      {/* Lobby Overlay */}
      {gameState.status === 'lobby' && (
        <LobbyComponent
          onStartGame={startNewMatch}
          language={language}
          onToggleLanguage={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
        />
      )}

      {/* Main Game Interface */}
      <div className="chaikhana-table-container">
        {/* Top Header Controls */}
        <div className="chaikhana-header">
          <div className="brand-title">
            <span>🀏</span>
            <span>{language === 'ar' ? 'دومينو الشايخانة' : 'Chaikhana Dominoes'}</span>
          </div>

          <div className="header-actions">
            <button className="icon-btn" onClick={toggleSound}>
              {soundMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              {language === 'ar' ? (soundMuted ? 'كتم' : 'صوت') : soundMuted ? 'Muted' : 'Sound'}
            </button>

            <button
              className="icon-btn"
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
            >
              {language === 'ar' ? 'English' : 'العربية'}
            </button>

            <button
              className="icon-btn"
              onClick={() => setGameState((prev) => ({ ...prev, status: 'lobby' }))}
            >
              <Home size={18} />
              {language === 'ar' ? 'الرئيسية' : 'Lobby'}
            </button>
          </div>
        </div>

        {/* Iraqi Bot Speech Bubble */}
        {activeBotDialogue && (
          <BotBannerComponent
            avatar={activeBotDialogue.avatar}
            botNameAr={activeBotDialogue.botNameAr}
            botNameEn={activeBotDialogue.botNameEn}
            messageAr={activeBotDialogue.messageAr}
            messageEn={activeBotDialogue.messageEn}
            language={language}
          />
        )}

        {/* Score Ledger Notebook */}
        {gameState.status !== 'lobby' && (
          <ScoreBoardComponent
            players={gameState.players}
            targetScore={gameState.targetScore}
            mode={gameState.mode}
            language={language}
          />
        )}

        {/* Domino Snake Table */}
        <TableComponent
          board={gameState.board}
          selectedTile={selectedTile}
          validPositions={
            selectedTile
              ? validMoves
                  .filter((m) => m.tile.id === selectedTile.id)
                  .map((m) => m.position)
              : []
          }
          onPlayTile={(pos) => {
            if (selectedTile) executePlayTile(selectedTile, pos);
          }}
          language={language}
        />

        {/* Interactive Iraqi Tea Glass */}
        <IstikanTeaComponent language={language} />

        {/* Bottom Player Hand Bar */}
        {currentPlayer && gameState.status === 'playing' && (
          <HandComponent
            player={currentPlayer}
            isCurrentTurn={!currentPlayer.isBot}
            selectedTile={selectedTile}
            playableTiles={playableTiles}
            onSelectTile={(tile) => {
              const moves = validMoves.filter((m) => m.tile.id === tile.id);
              if (moves.length === 1) {
                // Auto play if only 1 position option
                executePlayTile(tile, moves[0].position);
              } else {
                setSelectedTile(tile);
              }
            }}
            onDrawTile={handleDrawTile}
            onPassTurn={handlePassTurn}
            onSortHand={() => {
              const sorted = [...currentPlayer.hand].sort(
                (a, b) => b.top + b.bottom - (a.top + a.bottom)
              );
              setGameState((prev) => ({
                ...prev,
                players: prev.players.map((p, idx) =>
                  idx === prev.currentTurnIndex ? { ...p, hand: sorted } : p
                ),
              }));
            }}
            canDraw={playableTiles.length === 0 && gameState.boneyard.length > 0}
            canPass={playableTiles.length === 0 && gameState.boneyard.length === 0}
            boneyardCount={gameState.boneyard.length}
            language={language}
          />
        )}
      </div>

      {/* Round End Modal */}
      {gameState.status === 'round_ended' && gameState.roundWinner && (
        <div className="round-end-modal">
          <div className="round-end-card">
            <h2 style={{ color: 'var(--gold-accent)', fontSize: '1.6rem', marginBottom: '12px' }}>
              {gameState.roundWinner.reason === 'domino'
                ? language === 'ar'
                  ? '🎉 تسكير! خلصت الجلسة!'
                  : '🎉 Domino! Round Won!'
                : language === 'ar'
                ? '🔒 قفل! تم قفل الطاولة!'
                : '🔒 Locked Game!'}
            </h2>

            <p style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '16px' }}>
              {language === 'ar'
                ? `الربح بمقدار ${gameState.roundWinner.points} نقطة!`
                : `Scored ${gameState.roundWinner.points} points this round!`}
            </p>

            <button
              className="game-btn"
              style={{ width: '100%', justifyContent: 'center', background: 'var(--gold-accent)', color: 'var(--wood-dark)' }}
              onClick={() =>
                startNewRound(
                  gameState.mode,
                  gameState.players,
                  gameState.targetScore,
                  gameState.roundNumber + 1
                )
              }
            >
              <RotateCcw size={18} />
              {language === 'ar' ? 'الجولة التالية' : 'Next Round'}
            </button>
          </div>
        </div>
      )}

      {/* Match End Champion Modal */}
      {gameState.status === 'match_ended' && gameState.matchWinner && (
        <div className="round-end-modal">
          <div className="round-end-card" style={{ borderColor: '#ffd700' }}>
            <Sparkles size={48} color="#ffd700" style={{ margin: '0 auto 12px' }} />
            <h1 style={{ color: '#ffd700', fontSize: '2rem', marginBottom: '12px' }}>
              {language === 'ar' ? '👑 بطل الشايخانة!' : '👑 Chaikhana Champion!'}
            </h1>
            <h3 style={{ color: '#fff', marginBottom: '20px' }}>
              {gameState.matchWinner.player?.nameAr || gameState.matchWinner.player?.name}{' '}
              {language === 'ar' ? 'فاز باللعبة بالكامل!' : 'Won the entire match!'}
            </h3>

            <button
              className="game-btn"
              style={{ width: '100%', justifyContent: 'center', background: 'var(--gold-accent)', color: 'var(--wood-dark)' }}
              onClick={() => setGameState((prev) => ({ ...prev, status: 'lobby' }))}
            >
              <Home size={18} />
              {language === 'ar' ? 'العودة للرئيسية' : 'Return to Lobby'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
