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
import { multiplayerManager, type RoomMessage } from './utils/multiplayer';
import { TableComponent } from './components/Table';
import { HandComponent } from './components/Hand';
import { IstikanTeaComponent } from './components/IstikanTea';
import { ScoreBoardComponent } from './components/ScoreBoard';
import { BotBannerComponent } from './components/BotBanner';
import { LobbyComponent } from './components/Lobby';
import { Volume2, VolumeX, RotateCcw, Home, Sparkles, Radio, Copy, Check, Users } from 'lucide-react';
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
  const [ambientActive, setAmbientActive] = useState(false);
  const [selectedTile, setSelectedTile] = useState<TileType | null>(null);
  const [onlineRoomCode, setOnlineRoomCode] = useState<string | null>(null);
  const [onlineStatusText, setOnlineStatusText] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [myPlayerId, setMyPlayerId] = useState<string>('p0');

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

  // Handle Online Room Status Callbacks
  useEffect(() => {
    multiplayerManager.onStatusCallback = (status) => {
      setOnlineStatusText(status);
    };

    multiplayerManager.onMessageCallback = (msg: RoomMessage) => {
      if (msg.type === 'GAME_STATE_SYNC') {
        setGameState(msg.payload);
      } else if (msg.type === 'JOIN_ROOM' && multiplayerManager.isHost) {
        const guestName = msg.senderName || 'Guest';
        setGameState((prev) => {
          const updatedPlayers = prev.players.map((p) =>
            p.id === 'p1' ? { ...p, name: guestName, nameAr: guestName, isBot: false } : p
          );
          const newState = { ...prev, players: updatedPlayers };
          multiplayerManager.broadcastMessage('GAME_STATE_SYNC', newState);
          return newState;
        });
      } else if (msg.type === 'PLAY_TILE_ACTION' && multiplayerManager.isHost) {
        const { tile, position } = msg.payload;
        executePlayTile(tile, position);
      } else if (msg.type === 'DRAW_TILE_ACTION' && multiplayerManager.isHost) {
        handleDrawTile();
      } else if (msg.type === 'PASS_TURN_ACTION' && multiplayerManager.isHost) {
        handlePassTurn();
      }
    };
  }, []);

  // Broadcast state changes if Host
  const updateAndBroadcastState = (updater: (prev: GameState) => GameState) => {
    setGameState((prev) => {
      const nextState = updater(prev);
      if (prev.mode === 'online' && multiplayerManager.isHost) {
        multiplayerManager.broadcastMessage('GAME_STATE_SYNC', nextState);
      }
      return nextState;
    });
  };

  // Start New Game Match
  const startNewMatch = (
    mode: GameMode,
    playerName: string,
    targetScore: number,
    roomCodeInput?: string,
    isJoiningRoom?: boolean
  ) => {
    let initialPlayers: Player[] = [];

    if (mode === 'online') {
      setOnlineRoomCode(roomCodeInput || 'BAGHDAD');
      if (isJoiningRoom) {
        setMyPlayerId('p1');
        multiplayerManager.joinRoom(
          roomCodeInput || 'BAGHDAD',
          () => {
            multiplayerManager.broadcastMessage('JOIN_ROOM', {}, playerName);
          },
          (err) => setOnlineStatusText(err)
        );
        return;
      } else {
        setMyPlayerId('p0');
        multiplayerManager.createRoom(
          roomCodeInput || 'BAGHDAD',
          (code) => setOnlineRoomCode(code),
          (err) => setOnlineStatusText(err)
        );
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
            name: 'Waiting for Friend...',
            nameAr: 'بانتظار انضمام صديقك...',
            hand: [],
            isBot: true,
            team: 2,
            avatar: '👨‍🦱',
            score: 0,
          },
        ];
      }
    } else if (mode === '1v1') {
      setMyPlayerId('p0');
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
      setMyPlayerId('p0');
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
          team: 1,
          avatar: '👴',
          score: 0,
        },
        {
          id: 'p3',
          name: 'Um Fahad',
          nameAr: 'أم فهد',
          hand: [],
          isBot: true,
          team: 2,
          avatar: '👵',
          score: 0,
        },
      ];
    } else {
      setMyPlayerId('p0');
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

    updatedPlayers.forEach((p, idx) => {
      p.hand = fullDeck.slice(idx * 7, (idx + 1) * 7);
    });

    if (mode === '1v1' || mode === 'pass_play' || mode === 'online') {
      boneyard = fullDeck.slice(14);
    }

    const openingInfo = findOpeningPlayerIndex(updatedPlayers);

    const initialRoundState: GameState = {
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
    };

    setGameState(initialRoundState);

    if (mode === 'online' && multiplayerManager.isHost) {
      multiplayerManager.broadcastMessage('GAME_STATE_SYNC', initialRoundState);
    }
  };

  const currentPlayer = gameState.players[gameState.currentTurnIndex];
  const isMyTurn =
    gameState.mode === 'online'
      ? currentPlayer?.id === myPlayerId
      : !currentPlayer?.isBot;

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

  // Execute playing a tile onto board with STRICT matching validation & visual alignment
  const executePlayTile = (tile: TileType, position: PlayPosition) => {
    const isDouble = isDoubleTile(tile);
    if (isDouble && tile.top === 6) {
      soundEngine.speakIraqiPhrase('دوش عراقي!');
    }

    let newLeftEnd = gameState.board.leftEnd;
    let newRightEnd = gameState.board.rightEnd;
    let displayTop = tile.top;
    let displayBottom = tile.bottom;
    let matchingEndVal = 0;

    if (newLeftEnd === null || newRightEnd === null) {
      // First tile played on empty board
      newLeftEnd = tile.top;
      newRightEnd = tile.bottom;
      displayTop = tile.top;
      displayBottom = tile.bottom;
      matchingEndVal = tile.top;
    } else if (position === 'left' || position === 'first') {
      const L = newLeftEnd;
      matchingEndVal = L;

      if (tile.top === L) {
        // Matching end is tile.top. Exposed new left end is tile.bottom.
        newLeftEnd = tile.bottom;
        displayTop = tile.bottom; // Facing left
        displayBottom = tile.top;  // Touching existing chain (L)
      } else if (tile.bottom === L) {
        // Matching end is tile.bottom. Exposed new left end is tile.top.
        newLeftEnd = tile.top;
        displayTop = tile.top;     // Facing left
        displayBottom = tile.bottom; // Touching existing chain (L)
      } else {
        // Strict Validation: Tile does NOT match left end! Reject move.
        soundEngine.playPassSound();
        return;
      }
    } else if (position === 'right') {
      const R = newRightEnd;
      matchingEndVal = R;

      if (tile.top === R) {
        // Matching end is tile.top. Exposed new right end is tile.bottom.
        newRightEnd = tile.bottom;
        displayTop = tile.top;       // Touching existing chain (R)
        displayBottom = tile.bottom; // Facing right
      } else if (tile.bottom === R) {
        // Matching end is tile.bottom. Exposed new right end is tile.top.
        newRightEnd = tile.top;
        displayTop = tile.bottom;    // Touching existing chain (R)
        displayBottom = tile.top;    // Facing right
      } else {
        // Strict Validation: Tile does NOT match right end! Reject move.
        soundEngine.playPassSound();
        return;
      }
    }

    soundEngine.playTileSlam();

    const newPlayedTile: PlayedTile = {
      tile,
      isDouble,
      position,
      orientation: isDouble ? 'vertical' : 'horizontal',
      displayTop,
      displayBottom,
      matchingEndVal,
    };

    const newBoardTiles =
      position === 'left'
        ? [newPlayedTile, ...gameState.board.tiles]
        : [...gameState.board.tiles, newPlayedTile];

    updateAndBroadcastState((prev) => {
      const updatedPlayers = prev.players.map((p, idx) => {
        if (idx === prev.currentTurnIndex) {
          return {
            ...p,
            hand: p.hand.filter((t) => t.id !== tile.id),
            isPassed: false,
          };
        }
        return p;
      });

      const activeP = updatedPlayers[prev.currentTurnIndex];

      if (activeP.hand.length === 0) {
        handleRoundWin(activeP, 'domino', updatedPlayers);
        return prev;
      }

      const nextTurnIndex = (prev.currentTurnIndex + 1) % prev.players.length;

      return {
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
      };
    });

    setSelectedTile(null);
  };

  // Handle Player Drawing Tile from Boneyard
  const handleDrawTile = () => {
    if (gameState.boneyard.length === 0) return;

    soundEngine.playTileShuffle();

    if (gameState.mode === 'online' && !multiplayerManager.isHost) {
      multiplayerManager.broadcastMessage('DRAW_TILE_ACTION', {});
      return;
    }

    updateAndBroadcastState((prev) => {
      const drawnTile = prev.boneyard[0];
      const newBoneyard = prev.boneyard.slice(1);

      const updatedPlayers = prev.players.map((p, idx) => {
        if (idx === prev.currentTurnIndex) {
          return { ...p, hand: [...p.hand, drawnTile] };
        }
        return p;
      });

      return {
        ...prev,
        players: updatedPlayers,
        boneyard: newBoneyard,
        lastActionMessage: {
          ar: `سحب ${currentPlayer.nameAr} قطعة من الخزنة`,
          en: `${currentPlayer.name} drew a tile from boneyard`,
        },
      };
    });
  };

  // Handle Player Passing Turn
  const handlePassTurn = () => {
    soundEngine.playPassSound();

    if (gameState.mode === 'online' && !multiplayerManager.isHost) {
      multiplayerManager.broadcastMessage('PASS_TURN_ACTION', {});
      return;
    }

    updateAndBroadcastState((prev) => {
      const updatedPlayers = prev.players.map((p, idx) => {
        if (idx === prev.currentTurnIndex) {
          return { ...p, isPassed: true };
        }
        return p;
      });

      const allPassed = updatedPlayers.every(
        (p) => p.isPassed || getValidMoves(p.hand, prev.board.leftEnd, prev.board.rightEnd).length === 0
      );

      if (allPassed && prev.board.tiles.length > 0) {
        handleBlockedGame(updatedPlayers);
        return prev;
      }

      const nextTurnIndex = (prev.currentTurnIndex + 1) % prev.players.length;

      return {
        ...prev,
        players: updatedPlayers,
        currentTurnIndex: nextTurnIndex,
        lastActionMessage: {
          ar: `مرر ${currentPlayer.nameAr} الدور (باص)`,
          en: `${currentPlayer.name} passed turn`,
        },
      };
    });
  };

  // Handle Round Win
  const handleRoundWin = (
    winnerPlayer: Player,
    reason: 'domino' | 'blocked',
    currentPlayers: Player[]
  ) => {
    soundEngine.playWinJingle();
    soundEngine.speakIraqiPhrase('عاشت الأيادي! خلصت الجلسة!');
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });

    let pointsGained = 0;
    const pipCounts: { [id: string]: number } = {};

    currentPlayers.forEach((p) => {
      pipCounts[p.id] = calculatePipCount(p.hand);
    });

    if (gameState.mode === '2v2') {
      const winningTeam = winnerPlayer.team;
      const opposingTeam = winningTeam === 1 ? 2 : 1;
      pointsGained = currentPlayers
        .filter((p) => p.team === opposingTeam)
        .reduce((sum, p) => sum + pipCounts[p.id], 0);
    } else {
      pointsGained = currentPlayers
        .filter((p) => p.id !== winnerPlayer.id)
        .reduce((sum, p) => sum + pipCounts[p.id], 0);
    }

    const updatedPlayers = currentPlayers.map((p) => {
      if (
        (gameState.mode === '2v2' && p.team === winnerPlayer.team) ||
        p.id === winnerPlayer.id
      ) {
        return { ...p, score: p.score + pointsGained };
      }
      return p;
    });

    const matchWinnerPlayer = updatedPlayers.find(
      (p) => p.score >= gameState.targetScore
    );

    updateAndBroadcastState((prev) => ({
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

  // Handle Blocked Game
  const handleBlockedGame = (currentPlayers: Player[]) => {
    soundEngine.playBlockSound();
    soundEngine.speakIraqiPhrase('قفلت الجلسة! نحسب الخرز!');

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
        const randDialogue =
          BOT_DIALOGUES_PLAY[Math.floor(Math.random() * BOT_DIALOGUES_PLAY.length)];
        setActiveBotDialogue({
          botNameAr: currentPlayer.nameAr,
          botNameEn: currentPlayer.name,
          avatar: currentPlayer.avatar,
          messageAr: randDialogue.ar,
          messageEn: randDialogue.en,
        });

        if (Math.random() < 0.4) {
          soundEngine.speakIraqiPhrase(randDialogue.ar);
        }

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

  const toggleAmbientSound = () => {
    const isActive = soundEngine.toggleAmbientSoundscape();
    setAmbientActive(isActive);
  };

  const handleTilePlacementAction = (position: PlayPosition, droppedTileId?: string) => {
    let tileToPlay = selectedTile;
    if (droppedTileId && currentPlayer) {
      const foundInHand = currentPlayer.hand.find((t) => t.id === droppedTileId);
      if (foundInHand) tileToPlay = foundInHand;
    }

    if (!tileToPlay) return;

    if (gameState.mode === 'online' && !multiplayerManager.isHost) {
      multiplayerManager.broadcastMessage('PLAY_TILE_ACTION', {
        tile: tileToPlay,
        position,
      });
      setSelectedTile(null);
      return;
    }

    // Verify move validity for position
    const movesForTile = validMoves.filter((m) => m.tile.id === tileToPlay!.id);
    if (movesForTile.some((m) => m.position === position || m.position === 'first')) {
      executePlayTile(tileToPlay, position);
    }
  };

  const copyRoomCode = () => {
    if (onlineRoomCode) {
      navigator.clipboard.writeText(onlineRoomCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const myPlayerObject = gameState.players.find((p) => p.id === myPlayerId) || currentPlayer;

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

            {/* Online Room Code Banner */}
            {gameState.mode === 'online' && onlineRoomCode && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(229,184,66,0.2)', padding: '4px 10px', borderRadius: '12px', border: '1px solid var(--gold-accent)', fontSize: '0.85rem' }}>
                <Users size={16} />
                <span>{language === 'ar' ? 'رمز الغرفة:' : 'Room Code:'}</span>
                <strong style={{ color: '#ffd700', letterSpacing: '1px' }}>{onlineRoomCode}</strong>
                <button className="icon-btn" onClick={copyRoomCode} style={{ padding: '2px 6px', fontSize: '0.75rem' }}>
                  {copiedCode ? <Check size={14} color="#4ef037" /> : <Copy size={14} />}
                </button>
              </div>
            )}
          </div>

          <div className="header-actions">
            <button
              className={`icon-btn ${ambientActive ? 'active-ambient' : ''}`}
              onClick={toggleAmbientSound}
              style={{
                borderColor: ambientActive ? '#4ef037' : 'var(--gold-accent)',
                boxShadow: ambientActive ? '0 0 10px rgba(78, 240, 55, 0.6)' : 'none',
              }}
            >
              <Radio size={18} color={ambientActive ? '#4ef037' : '#fff'} />
              {language === 'ar'
                ? ambientActive
                  ? 'أصوات الشارع 🔊'
                  : 'أجواء الشايخانة 🫖'
                : ambientActive
                ? 'Ambient ON 🔊'
                : 'Cafe Vibe 🫖'}
            </button>

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
              onClick={() => {
                multiplayerManager.destroy();
                setGameState((prev) => ({ ...prev, status: 'lobby' }));
              }}
            >
              <Home size={18} />
              {language === 'ar' ? 'الرئيسية' : 'Lobby'}
            </button>
          </div>
        </div>

        {/* Online Status Toast */}
        {onlineStatusText && gameState.mode === 'online' && (
          <div style={{ background: 'rgba(0,0,0,0.85)', color: 'var(--gold-accent)', padding: '6px 14px', borderRadius: '20px', border: '1px solid var(--gold-accent)', fontSize: '0.85rem', position: 'absolute', top: '70px', right: '20px', zIndex: 30 }}>
            {onlineStatusText}
          </div>
        )}

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
          onPlayTile={handleTilePlacementAction}
          language={language}
        />

        {/* Interactive Iraqi Tea Glass */}
        <IstikanTeaComponent language={language} />

        {/* Bottom Player Hand Bar */}
        {myPlayerObject && gameState.status === 'playing' && (
          <HandComponent
            player={myPlayerObject}
            isCurrentTurn={isMyTurn}
            selectedTile={selectedTile}
            playableTiles={isMyTurn ? playableTiles : []}
            onDragStartTile={(tile) => setSelectedTile(tile)}
            onSelectTile={(tile) => {
              const moves = validMoves.filter((m) => m.tile.id === tile.id);
              if (moves.length === 1) {
                handleTilePlacementAction(moves[0].position);
              } else {
                setSelectedTile(tile);
              }
            }}
            onDrawTile={handleDrawTile}
            onPassTurn={handlePassTurn}
            onSortHand={() => {
              const sorted = [...myPlayerObject.hand].sort(
                (a, b) => b.top + b.bottom - (a.top + a.bottom)
              );
              setGameState((prev) => ({
                ...prev,
                players: prev.players.map((p) =>
                  p.id === myPlayerObject.id ? { ...p, hand: sorted } : p
                ),
              }));
            }}
            canDraw={isMyTurn && playableTiles.length === 0 && gameState.boneyard.length > 0}
            canPass={isMyTurn && playableTiles.length === 0 && gameState.boneyard.length === 0}
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
