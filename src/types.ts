export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export interface CardData {
  id: string;
  suit: Suit;
  rank: Rank;
}

export type GameStatus = 'setup' | 'playing' | 'won' | 'lost' | 'waiting_for_suit';

export interface Player {
  id: number;
  name: string;
  isHuman: boolean;
  hand: CardData[];
}

export interface GameState {
  deck: CardData[];
  discardPile: CardData[];
  players: Player[];
  currentTurnIndex: number;
  status: GameStatus;
  currentSuit: Suit | null; // For when an 8 is played
  lastAction: string;
  winnerId: number | null;
  cardBackUrl: string;
}
