// File: ./src/app/WordQuest/Card/Manager/CardList.tsx

import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import React from 'react';

import { useDecks } from '../Deck/DeckContext';
import { Card } from '../types';

interface CardListProps {
  cards: Card[];
  setEditingCard: (card: Card) => void;
  deleteCard: (id: string) => void;
}

const CardList: React.FC<CardListProps> = ({ cards, setEditingCard, deleteCard }) => {
  const { decks } = useDecks();

  const getDeckName = (deckId?: string) => {
    if (!deckId) return 'None';
    const deck = decks.find((d) => d.id === deckId);
    return deck ? deck.name : 'Unknown';
  };

  return (
    <div>
      <Typography variant="h5" gutterBottom>
        Existing Cards
      </Typography>
      {cards.length === 0 ? (
        <Typography variant="body1">No cards available.</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table aria-label="card table">
            <TableHead>
              <TableRow>
                <TableCell>Question</TableCell>
                <TableCell>Answer</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Deck</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cards.map((card) => (
                <TableRow key={card.id}>
                  <TableCell>{card.question}</TableCell>
                  <TableCell>{card.answer}</TableCell>
                  <TableCell>{card.category}</TableCell>
                  <TableCell>{getDeckName(card.deckId)}</TableCell>
                  <TableCell align="right">
                    {!card.id.startsWith('card-tech-') && (
                      <>
                        <IconButton color="primary" onClick={() => setEditingCard(card)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton color="secondary" onClick={() => deleteCard(card.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
};

export default CardList;
