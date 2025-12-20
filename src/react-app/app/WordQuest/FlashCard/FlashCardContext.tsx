// File: ./src/app/WordQuest/FlashCard/FlashCardContext.tsx

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '@/components/context/AuthContext';

import { getLocalStorageItem, setLocalStorageItem } from '@/components/utils/localStorageUtils';

import { getInitialData } from './seedData';
import { FlashCard } from './types';

export interface FlashCardContextType {
  flashCards: FlashCard[];
  addFlashCard: (card: Omit<FlashCard, 'id'>) => void;
  updateFlashCard: (card: FlashCard) => void;
  deleteFlashCard: (id: string) => void;
}

export const FlashCardContext = createContext<FlashCardContextType | undefined>(undefined);

export const FlashCardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [flashCards, setFlashCards] = useState<FlashCard[]>([]);
  const isInitialMount = useRef(true);
  const { token } = useAuth();

  useEffect(() => {
    if (!token) {
      const timer = setTimeout(() => {
        setFlashCards(getLocalStorageItem<FlashCard[]>('flashCards', []));
      }, 0);
      return () => clearTimeout(timer);
    }

    fetch('/api/v1/flashcards', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : { flashCards: [] }))
      .then((data: { flashCards: FlashCard[] }) => {
        if (data.flashCards) setFlashCards(data.flashCards);
      })
      .catch((err) => console.error('Failed to load flashcards', err));
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
      version: 0,
    };
    // Optimistically add
    setFlashCards((prev) => [...prev, newCard]);

    if (token) {
      try {
        const res = await fetch('/api/v1/flashcards', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(newCard),
        });

        if (res.ok) {
          // Update version from server
          const saved = await res.json();
          if (saved && typeof saved.version === 'number') {
            setFlashCards((prev) =>
              prev.map((c) => (c.id === newCard.id ? { ...c, version: saved.version } : c)),
            );
          }
        } else {
          console.error('Failed to save flashcard', res.statusText);
        }
      } catch (err) {
        console.error('Failed to save flashcard', err);
      }
    }
  };

  const updateFlashCard = async (updatedCard: FlashCard) => {
    // Optimistically update
    setFlashCards((prev) => prev.map((card) => (card.id === updatedCard.id ? updatedCard : card)));

    if (token) {
      try {
        const expectedVersion = updatedCard.version || 0;
        const res = await fetch(`/api/v1/flashcards/${updatedCard.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            expectedVersion,
            patch: {
              question: updatedCard.question,
              answer: updatedCard.answer,
              category: updatedCard.category,
              deckId: updatedCard.deckId,
            },
          }),
        });

        if (!res.ok) {
          if (res.status === 409) {
            console.warn('Flashcard conflict detected. Reloading.');
            if (typeof window !== 'undefined')
              window.dispatchEvent(new CustomEvent('flashcard-conflict'));

            // Helper to reload
            fetch('/api/v1/flashcards', {
              headers: { Authorization: `Bearer ${token}` },
            })
              .then((r) => r.json())
              .then((d) => {
                if (d.flashCards) setFlashCards(d.flashCards);
              });
            return;
          }
          console.error('Failed to update flashcard', res.statusText);
        } else {
          // Update version
          const saved = await res.json();
          if (saved && typeof saved.version === 'number') {
            setFlashCards((prev) =>
              prev.map((c) => (c.id === updatedCard.id ? { ...c, version: saved.version } : c)),
            );
          }
        }
      } catch (err) {
        console.error('Failed to update flashcard', err);
      }
    }
  };

  const deleteFlashCard = async (id: string) => {
    setFlashCards((prev) => prev.filter((card) => card.id !== id));

    if (token) {
      try {
        await fetch(`/api/v1/flashcards/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err) {
        console.error('Failed to delete flashcard', err);
      }
    }
  };

  const [nativeFlashCards, setNativeFlashCards] = useState<FlashCard[]>([]);

  useEffect(() => {
    getInitialData().then(({ flashCards }) => setNativeFlashCards(flashCards));
  }, []);

  const allFlashCards = React.useMemo(
    () => [...nativeFlashCards, ...flashCards],
    [nativeFlashCards, flashCards],
  );

  return (
    <FlashCardContext.Provider
      value={{ flashCards: allFlashCards, addFlashCard, updateFlashCard, deleteFlashCard }}
    >
      {children}
    </FlashCardContext.Provider>
  );
};

export const useFlashCards = (): FlashCardContextType => {
  const context = useContext(FlashCardContext);
  if (!context) {
    throw new Error('useFlashCards must be used within a FlashCardProvider');
  }
  return context;
};
