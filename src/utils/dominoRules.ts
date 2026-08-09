import type { Tile, PlayPosition, Player } from '../types/domino';

// Generate standard 28-tile Double-Six set
export function generateFullDeck(): Tile[] {
  const deck: Tile[] = [];
  let idCounter = 0;
  for (let top = 0; top <= 6; top++) {
    for (let bottom = top; bottom <= 6; bottom++) {
      deck.push({
        id: `tile-${top}-${bottom}-${idCounter++}`,
        top,
        bottom,
      });
    }
  }
  return deck;
}

// Fisher-Yates Shuffle
export function shuffleDeck(deck: Tile[]): Tile[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function calculatePipCount(hand: Tile[]): number {
  return hand.reduce((sum, tile) => sum + tile.top + tile.bottom, 0);
}

export function isDoubleTile(tile: Tile): boolean {
  return tile.top === tile.bottom;
}

export interface ValidMove {
  tile: Tile;
  position: PlayPosition;
  matchingEndVal: number;
}

export function getValidMoves(
  hand: Tile[],
  leftEnd: number | null,
  rightEnd: number | null,
  mustPlayHighestDouble = false
): ValidMove[] {
  // Empty board
  if (leftEnd === null || rightEnd === null) {
    if (mustPlayHighestDouble) {
      // Find highest double in hand
      let highestDouble: Tile | null = null;
      for (let d = 6; d >= 0; d--) {
        const found = hand.find((t) => t.top === d && t.bottom === d);
        if (found) {
          highestDouble = found;
          break;
        }
      }
      if (highestDouble) {
        return [
          {
            tile: highestDouble,
            position: 'first',
            matchingEndVal: highestDouble.top,
          },
        ];
      }
    }

    // Play any tile on empty board
    return hand.map((tile) => ({
      tile,
      position: 'first',
      matchingEndVal: tile.top,
    }));
  }

  const validMoves: ValidMove[] = [];

  for (const tile of hand) {
    const matchesLeftTop = tile.top === leftEnd;
    const matchesLeftBottom = tile.bottom === leftEnd;
    const matchesRightTop = tile.top === rightEnd;
    const matchesRightBottom = tile.bottom === rightEnd;

    // Check left end
    if (matchesLeftTop || matchesLeftBottom) {
      validMoves.push({
        tile,
        position: 'left',
        matchingEndVal: leftEnd,
      });
    }

    // Check right end
    if (matchesRightTop || matchesRightBottom) {
      // Avoid duplicate entry if leftEnd === rightEnd and tile fits both
      const alreadyAddedLeft = validMoves.some(
        (m) => m.tile.id === tile.id && m.position === 'left'
      );
      if (!alreadyAddedLeft || leftEnd !== rightEnd) {
        validMoves.push({
          tile,
          position: 'right',
          matchingEndVal: rightEnd,
        });
      }
    }
  }

  return validMoves;
}

// Find opening player for Round 1 based on Iraqi rules (highest double 6-6 down to 0-0)
export function findOpeningPlayerIndex(players: Player[]): {
  playerIndex: number;
  highestDouble: Tile | null;
} {
  for (let doubleVal = 6; doubleVal >= 0; doubleVal--) {
    for (let pIdx = 0; pIdx < players.length; pIdx++) {
      const hasDouble = players[pIdx].hand.find(
        (t) => t.top === doubleVal && t.bottom === doubleVal
      );
      if (hasDouble) {
        return { playerIndex: pIdx, highestDouble: hasDouble };
      }
    }
  }

  // Fallback: Player with highest total pips if no doubles
  let maxPips = -1;
  let chosenIdx = 0;
  players.forEach((p, idx) => {
    const pips = calculatePipCount(p.hand);
    if (pips > maxPips) {
      maxPips = pips;
      chosenIdx = idx;
    }
  });

  return { playerIndex: chosenIdx, highestDouble: null };
}

// Determine smart AI move
export function selectBotMove(
  hand: Tile[],
  leftEnd: number | null,
  rightEnd: number | null,
  mustPlayHighestDouble = false
): ValidMove | null {
  const validMoves = getValidMoves(
    hand,
    leftEnd,
    rightEnd,
    mustPlayHighestDouble
  );
  if (validMoves.length === 0) return null;

  // 1. Prefer playing double tiles first (to clear heavy doubles like 6-6, 5-5)
  const doubleMove = validMoves.find((m) => isDoubleTile(m.tile));
  if (doubleMove) return doubleMove;

  // 2. Prefer tiles with higher total pips to dump points
  validMoves.sort((a, b) => {
    const pipA = a.tile.top + a.tile.bottom;
    const pipB = b.tile.top + b.tile.bottom;
    return pipB - pipA;
  });

  return validMoves[0];
}
