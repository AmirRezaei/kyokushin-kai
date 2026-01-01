// File: ./src/app/WordQuest/Card/CardContext.tsx

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '@/components/context/AuthContext';

import { getLocalStorageItem, setLocalStorageItem } from '@/components/utils/localStorageUtils';
import { useCurriculumGrades } from '@/hooks/useCatalog';

import { getInitialData } from './seedData';
import { Card } from './types';

export interface CardContextType {
  cards: Card[];
  addCard: (card: Omit<Card, 'id'>) => void;
  updateCard: (card: Card) => void;
  deleteCard: (id: string) => void;
}

export const CardContext = createContext<CardContextType | undefined>(undefined);

export const CardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cards, setCards] = useState<Card[]>([]);
  const isInitialMount = useRef(true);
  const { token } = useAuth();
  const { grades } = useCurriculumGrades();

  useEffect(() => {
    if (!token) {
      const timer = setTimeout(() => {
        setCards(getLocalStorageItem<Card[]>('cards', []));
      }, 0);
      return () => clearTimeout(timer);
    }

    fetch('/api/v1/cards', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : { cards: [] }))
      .then((data: { cards: Card[] }) => {
        if (data.cards) setCards(data.cards);
      })
      .catch((err) => console.error('Failed to load cards', err));
  }, [token]);

  useEffect(() => {
    if (!token && !isInitialMount.current) {
      setLocalStorageItem<Card[]>('cards', cards);
    }
  }, [cards, token]);

  const addCard = async (card: Omit<Card, 'id'>) => {
    const newCard: Card = {
      id: uuidv4(),
      ...card,
      version: 0,
    };
    // Optimistically add
    setCards((prev) => [...prev, newCard]);

    if (token) {
      try {
        const res = await fetch('/api/v1/cards', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(newCard),
        });

        if (res.ok) {
          // Update version from server
          const saved = await res.json();
          if (saved && typeof saved.version === 'number') {
            setCards((prev) =>
              prev.map((c) => (c.id === newCard.id ? { ...c, version: saved.version } : c)),
            );
          }
        } else {
          console.error('Failed to save card', res.statusText);
        }
      } catch (err) {
        console.error('Failed to save card', err);
      }
    }
  };

  const updateCard = async (updatedCard: Card) => {
    // Optimistically update
    setCards((prev) => prev.map((card) => (card.id === updatedCard.id ? updatedCard : card)));

    if (token) {
      try {
        const expectedVersion = updatedCard.version || 0;
        const res = await fetch(`/api/v1/cards/${updatedCard.id}`, {
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
            console.warn('Card conflict detected. Reloading.');
            if (typeof window !== 'undefined')
              window.dispatchEvent(new CustomEvent('card-conflict'));

            // Helper to reload
            fetch('/api/v1/cards', {
              headers: { Authorization: `Bearer ${token}` },
            })
              .then((r) => r.json())
              .then((d) => {
                if (d.cards) setCards(d.cards);
              });
            return;
          }
          console.error('Failed to update card', res.statusText);
        } else {
          // Update version
          const saved = await res.json();
          if (saved && typeof saved.version === 'number') {
            setCards((prev) =>
              prev.map((c) => (c.id === updatedCard.id ? { ...c, version: saved.version } : c)),
            );
          }
        }
      } catch (err) {
        console.error('Failed to update card', err);
      }
    }
  };

  const deleteCard = async (id: string) => {
    setCards((prev) => prev.filter((card) => card.id !== id));

    if (token) {
      try {
        await fetch(`/api/v1/cards/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err) {
        console.error('Failed to delete card', err);
      }
    }
  };

  const [nativeCards, setNativeCards] = useState<Card[]>([]);

  useEffect(() => {
    if (grades.length === 0) return;
    getInitialData(grades).then(({ cards }) => setNativeCards(cards));
  }, [grades]);

  const allCards = React.useMemo(() => [...nativeCards, ...cards], [nativeCards, cards]);

  return (
    <CardContext.Provider value={{ cards: allCards, addCard, updateCard, deleteCard }}>
      {children}
    </CardContext.Provider>
  );
};

export const useCards = (): CardContextType => {
  const context = useContext(CardContext);
  if (!context) {
    throw new Error('useCards must be used within a CardProvider');
  }
  return context;
};
