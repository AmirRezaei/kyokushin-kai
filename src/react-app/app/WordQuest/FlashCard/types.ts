// File: ./src/app/WordQuest/FlashCard/types.ts

export interface FlashCard {
   id: string;
   question: string;
   answer: string;
   category?: string; // Optional: for organizing flashcards
   deckId?: string; // Optional: to associate flashcard with a deck
}

export interface Deck {
   id: string;
   name: string;
   description?: string;
   flashCardIds: string[];
}
