// File: ./src/app/WordQuest/Card/Manager/CardForm.tsx

import {
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';

import { Card } from '../types';

interface CardFormProps {
  addCard: (card: Omit<Card, 'id'>) => void;
  editingCard: Card | null;
  updateCard: (card: Card) => void;
}

import { useDecks } from '../Deck/DeckContext';

// ...

const CardForm: React.FC<CardFormProps> = ({ addCard, editingCard, updateCard }) => {
  const { decks } = useDecks();
  const [question, setQuestion] = useState<string>(editingCard?.question || '');
  const [answer, setAnswer] = useState<string>(editingCard?.answer || '');
  const [category, setCategory] = useState<string>(editingCard?.category || '');
  const [deckId, setDeckId] = useState<string>(
    editingCard?.deckId || (decks.length > 0 ? decks[0].id : ''),
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!deckId || deckId === 'All') {
      // Should be handled by required attribute or validation, but safety check
      alert('Please select a deck.');
      return;
    }

    if (editingCard) {
      updateCard({
        ...editingCard,
        question: question.trim(),
        answer: answer.trim(),
        category: category.trim() || undefined,
        deckId: deckId,
      });
    } else {
      addCard({
        question: question.trim(),
        answer: answer.trim(),
        category: category.trim() || undefined,
        deckId: deckId,
      });
    }

    // Reset form
    setQuestion('');
    setAnswer('');
    setCategory('');
    setDeckId(decks.length > 0 ? decks[0].id : '');
  };

  return (
    <Paper key={editingCard?.id || 'new'} elevation={3} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {editingCard ? 'Edit Card' : 'Add New Card'}
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Question"
              variant="outlined"
              fullWidth
              required
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Answer"
              variant="outlined"
              fullWidth
              required
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Category (Optional)"
              variant="outlined"
              fullWidth
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl variant="outlined" fullWidth required>
              <InputLabel id="deck-select-label">Deck</InputLabel>
              <Select
                labelId="deck-select-label"
                id="deck-select"
                value={deckId}
                onChange={(e) => setDeckId(e.target.value as string)}
                label="Deck"
              >
                {decks.map((deck) => (
                  <MenuItem key={deck.id} value={deck.id}>
                    {deck.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sx={{ textAlign: 'right' }}>
            {editingCard && (
              <Button
                variant="outlined"
                sx={{ mr: 2 }}
                onClick={() => {
                  // Reset editing
                  setQuestion('');
                  setAnswer('');
                  setCategory('');
                  setDeckId(decks.length > 0 ? decks[0].id : '');
                }}
              >
                Cancel
              </Button>
            )}
            <Button type="submit" variant="contained" color="primary">
              {editingCard ? 'Update Card' : 'Add Card'}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default CardForm;
