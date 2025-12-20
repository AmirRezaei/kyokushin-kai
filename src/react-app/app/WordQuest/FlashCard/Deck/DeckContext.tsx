// File: ./src/app/WordQuest/FlashCard/Deck/DeckContext.tsx

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '@/components/context/AuthContext';

import { getLocalStorageItem, setLocalStorageItem } from '@/components/utils/localStorageUtils';

import { getInitialData } from '../seedData';
import { Deck, FlashCard } from '../types';

export interface DeckContextType {
  decks: Deck[];
  addDeck: (deck: Omit<Deck, 'id' | 'flashCardIds'>) => void;
  updateDeck: (deck: Deck) => void;
  deleteDeck: (id: string) => void;
}

export const DeckContext = createContext<DeckContextType | undefined>(undefined);

export const DeckProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [decks, setDecks] = useState<Deck[]>([]);
  const isInitialMount = useRef(true);

  const { token } = useAuth();

  // Combine native decks with user decks for consumption
  const [nativeDecks, setNativeDecks] = useState<Deck[]>([]);

  useEffect(() => {
    getInitialData().then(({ decks }) => {
      setNativeDecks(decks);
    });
  }, []);

  useEffect(() => {
    if (!token) {
      const timer = setTimeout(() => {
        setDecks(getLocalStorageItem<Deck[]>('decks', []));
      }, 0);
      return () => clearTimeout(timer);
    }

    fetch('/api/v1/decks', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : { decks: [] }))
      .then((data: { decks: Deck[] }) => {
        if (data.decks) setDecks(data.decks);
      })
      .catch((err) => console.error('Failed to load decks', err));
  }, [token]);

  // Fallback save to local storage if not authenticated
  useEffect(() => {
    if (!token && !isInitialMount.current) {
      setLocalStorageItem<Deck[]>('decks', decks);
    }
  }, [decks, token]);

  const addDeck = async (deck: Omit<Deck, 'id' | 'flashCardIds'>) => {
    const newDeck: Deck = {
      id: uuidv4(),
      name: deck.name,
      description: deck.description,
      flashCardIds: [],
      version: 0,
    };

    // Optimistic updatest
    setDecks((prev) => [...prev, newDeck]);

    if (token) {
      try {
        const res = await fetch('/api/v1/decks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(newDeck),
        });
        if (res.ok) {
          const saved = await res.json();
          if (saved && typeof saved.version === 'number') {
            setDecks((prev) =>
              prev.map((d) => (d.id === newDeck.id ? { ...d, version: saved.version } : d)),
            );
          }
        } else {
          console.error('Failed to save deck', res.statusText);
        }
      } catch (err) {
        console.error('Failed to save deck', err);
      }
    }
  };

  const updateDeck = async (updatedDeck: Deck) => {
    setDecks((prev) => prev.map((deck) => (deck.id === updatedDeck.id ? updatedDeck : deck)));

    if (token) {
      try {
        const expectedVersion = updatedDeck.version || 0;
        const res = await fetch(`/api/v1/decks/${updatedDeck.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            expectedVersion,
            patch: {
              name: updatedDeck.name,
              description: updatedDeck.description,
              flashCardIds: updatedDeck.flashCardIds,
            },
          }),
        });

        if (!res.ok) {
          if (res.status === 409) {
            console.warn('Deck conflict detected. Reloading.');
            if (typeof window !== 'undefined')
              window.dispatchEvent(new CustomEvent('deck-conflict'));

            fetch('/api/v1/decks', { headers: { Authorization: `Bearer ${token}` } })
              .then((r) => r.json())
              .then((d) => {
                if (d.decks) setDecks(d.decks);
              });
            return;
          }
          console.error('Failed to update deck', res.statusText);
        } else {
          const saved = await res.json();
          if (saved && typeof saved.version === 'number') {
            setDecks((prev) =>
              prev.map((d) => (d.id === updatedDeck.id ? { ...d, version: saved.version } : d)),
            );
          }
        }
      } catch (err) {
        console.error('Failed to update deck', err);
      }
    }
  };

  const deleteDeck = async (id: string) => {
    setDecks((prev) => prev.filter((deck) => deck.id !== id));

    // Also update flashcards locally if in fallback mode
    if (!token) {
      const flashCards = getLocalStorageItem<FlashCard[]>('flashCards', []);
      const updatedFlashCards = flashCards.map((card) =>
        card.deckId === id ? { ...card, deckId: undefined } : card,
      );
      setLocalStorageItem<FlashCard[]>('flashCards', updatedFlashCards);
    } else {
      try {
        await fetch(`/api/v1/decks/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        // The backend handles unlinking cards
      } catch (err) {
        console.error('Failed to delete deck', err);
      }
    }
  };

  // Combine logic
  const allDecks = React.useMemo(() => [...nativeDecks, ...decks], [nativeDecks, decks]);

  return (
    <DeckContext.Provider value={{ decks: allDecks, addDeck, updateDeck, deleteDeck }}>
      {children}
    </DeckContext.Provider>
  );
};

export const useDecks = (): DeckContextType => {
  const context = useContext(DeckContext);
  if (!context) {
    throw new Error('useDecks must be used within a DeckProvider');
  }
  return context;
};
