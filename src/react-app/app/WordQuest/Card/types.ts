// File: ./src/app/WordQuest/Card/types.ts

export interface Card {
  id: string;
  question: string;
  answer: string;
  category?: string; // Optional: for organizing cards
  deckId?: string; // Optional: to associate card with a deck
  version?: number;
}

export interface Deck {
  id: string;
  name: string;
  description?: string;
  cardIds: string[];
  version?: number;
}
