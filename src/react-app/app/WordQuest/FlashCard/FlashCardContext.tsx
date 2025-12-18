// File: ./src/app/WordQuest/FlashCard/FlashCardContext.tsx

import React, {createContext, useContext, useEffect, useRef, useState} from 'react';
import {v4 as uuidv4} from 'uuid';
import { useAuth } from '@/components/context/AuthContext';

import {getLocalStorageItem, setLocalStorageItem} from '@/components/utils/localStorageUtils';

import {getInitialData} from './seedData';
import {FlashCard} from './types';

export interface FlashCardContextType {
   flashCards: FlashCard[];
   addFlashCard: (card: Omit<FlashCard, 'id'>) => void;
   updateFlashCard: (card: FlashCard) => void;
   deleteFlashCard: (id: string) => void;
}

export const FlashCardContext = createContext<FlashCardContextType | undefined>(undefined);

export const FlashCardProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
   const [flashCards, setFlashCards] = useState<FlashCard[]>([]);
   const isInitialMount = useRef(true);
   const { token } = useAuth();

   useEffect(() => {
      if (!token) {
          setFlashCards(getLocalStorageItem<FlashCard[]>('flashCards', []));
          return;
      }

      fetch('/api/v1/flashcards', {
          headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.ok ? res.json() : { flashCards: [] })
      .then((data: {flashCards: FlashCard[]}) => {
          if (data.flashCards) setFlashCards(data.flashCards);
      })
      .catch(err => console.error('Failed to load flashcards', err));
   }, [token]);

   useEffect(() => {
      if (!token && !isInitialMount.current) {
         setLocalStorageItem<FlashCard[]>('flashCards', flashCards);
      }
   }, [flashCards, token]);

   const addFlashCard = async (card: Omit<FlashCard, 'id'>) => {
      const newCard: FlashCard = {
         id: uuidv4(),
         ...card,
      };
      setFlashCards(prev => [...prev, newCard]);

      if (token) {
          try {
             await fetch('/api/v1/flashcards', {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                 body: JSON.stringify(newCard)
             });
          } catch (err) { console.error('Failed to save flashcard', err); }
      }
   };

   const updateFlashCard = async (updatedCard: FlashCard) => {
      setFlashCards(prev => prev.map(card => (card.id === updatedCard.id ? updatedCard : card)));

      if (token) {
          try {
             await fetch('/api/v1/flashcards', {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                 body: JSON.stringify(updatedCard)
             });
          } catch (err) { console.error('Failed to update flashcard', err); }
      }
   };

   const deleteFlashCard = async (id: string) => {
      setFlashCards(prev => prev.filter(card => card.id !== id));

      if (token) {
          try {
             await fetch(`/api/v1/flashcards/${id}`, {
                 method: 'DELETE',
                 headers: { Authorization: `Bearer ${token}` }
             });
          } catch (err) { console.error('Failed to delete flashcard', err); }
      }
   };

   const [nativeFlashCards, setNativeFlashCards] = useState<FlashCard[]>([]);
   
   useEffect(() => {
      getInitialData().then(({ flashCards }) => setNativeFlashCards(flashCards));
   }, []);

   const allFlashCards = React.useMemo(() => [...nativeFlashCards, ...flashCards], [nativeFlashCards, flashCards]);

   return <FlashCardContext.Provider value={{flashCards: allFlashCards, addFlashCard, updateFlashCard, deleteFlashCard}}>{children}</FlashCardContext.Provider>;
};

export const useFlashCards = (): FlashCardContextType => {
   const context = useContext(FlashCardContext);
   if (!context) {
      throw new Error('useFlashCards must be used within a FlashCardProvider');
   }
   return context;
};
