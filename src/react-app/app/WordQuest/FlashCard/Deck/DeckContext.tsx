// File: ./src/app/WordQuest/FlashCard/Deck/DeckContext.tsx

import React, {createContext, useContext, useEffect, useRef, useState} from 'react';
import {v4 as uuidv4} from 'uuid';

import {getLocalStorageItem, setLocalStorageItem} from '@/components/utils/localStorageUtils';

import {getInitialData} from '../seedData';
import {Deck, FlashCard} from '../types';

export interface DeckContextType {
   decks: Deck[];
   addDeck: (deck: Omit<Deck, 'id' | 'flashCardIds'>) => void;
   updateDeck: (deck: Deck) => void;
   deleteDeck: (id: string) => void;
}

export const DeckContext = createContext<DeckContextType | undefined>(undefined);

export const DeckProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
   const [decks, setDecks] = useState<Deck[]>([]);
   const isInitialMount = useRef(true);

   useEffect(() => {
      const storedDecks = getLocalStorageItem<Deck[]>('decks', []);
      setDecks(storedDecks);
   }, []);

   useEffect(() => {
      if (isInitialMount.current) {
         isInitialMount.current = false;
         return;
      }
      setLocalStorageItem<Deck[]>('decks', decks);
   }, [decks]);

   const addDeck = (deck: Omit<Deck, 'id' | 'flashCardIds'>) => {
      const newDeck: Deck = {
         id: uuidv4(),
         name: deck.name,
         description: deck.description,
         flashCardIds: [],
      };
      setDecks(prev => [...prev, newDeck]);
   };

   const updateDeck = (updatedDeck: Deck) => {
      setDecks(prev => prev.map(deck => (deck.id === updatedDeck.id ? updatedDeck : deck)));
   };

   const deleteDeck = (id: string) => {
      // Remove deckId from associated flashcards
      const flashCards = getLocalStorageItem<FlashCard[]>('flashCards', []);
      const updatedFlashCards = flashCards.map(card => (card.deckId === id ? {...card, deckId: undefined} : card));
      setLocalStorageItem<FlashCard[]>('flashCards', updatedFlashCards);

      setDecks(prev => prev.filter(deck => deck.id !== id));
   };

   // Combine native decks with user decks for consumption
   const [nativeDecks, setNativeDecks] = useState<Deck[]>([]);

   useEffect(() => {
      getInitialData().then(({decks}) => {
         setNativeDecks(decks);
      });
   }, []);

   // Filter out native decks if they are somehow in stored decks to avoid duplicates?
   // Or just show both. User decks might be edits.
   // The User asked to add them as "native predefined decks".
   // I will return (nativeDecks + decks) as the `decks` value exposed by provider.
   const allDecks = React.useMemo(() => [...nativeDecks, ...decks], [nativeDecks, decks]);

   return <DeckContext.Provider value={{decks: allDecks, addDeck, updateDeck, deleteDeck}}>{children}</DeckContext.Provider>;
};

export const useDecks = (): DeckContextType => {
   const context = useContext(DeckContext);
   if (!context) {
      throw new Error('useDecks must be used within a DeckProvider');
   }
   return context;
};
