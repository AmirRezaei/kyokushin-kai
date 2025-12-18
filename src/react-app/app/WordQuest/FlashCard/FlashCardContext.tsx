// File: ./src/app/WordQuest/FlashCard/FlashCardContext.tsx

import React, {createContext, useContext, useEffect, useRef, useState} from 'react';
import {v4 as uuidv4} from 'uuid';

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

   useEffect(() => {
      const storedCards = getLocalStorageItem<FlashCard[]>('flashCards', []);
      setFlashCards(storedCards);
   }, []);

   useEffect(() => {
      if (isInitialMount.current) {
         isInitialMount.current = false;
         return;
      }
      setLocalStorageItem<FlashCard[]>('flashCards', flashCards);
   }, [flashCards]);

   const addFlashCard = (card: Omit<FlashCard, 'id'>) => {
      const newCard: FlashCard = {
         id: uuidv4(),
         ...card,
      };
      setFlashCards(prev => [...prev, newCard]);
   };

   const updateFlashCard = (updatedCard: FlashCard) => {
      setFlashCards(prev => prev.map(card => (card.id === updatedCard.id ? updatedCard : card)));
   };

   const deleteFlashCard = (id: string) => {
      setFlashCards(prev => prev.filter(card => card.id !== id));
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
