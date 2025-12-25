// File: ./src/app/WordQuest/Card/CardItem.tsx

import {
  Button,
  Card as MuiCard,
  CardActions,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';

import { Card as CardType } from './types';

interface CardItemProps {
  card: CardType;
  setEditingCard: (card: CardType) => void;
  deleteCard: (id: string) => void;
}

const CardItem: React.FC<CardItemProps> = ({ card, setEditingCard, deleteCard }) => {
  const [openDelete, setOpenDelete] = useState<boolean>(false);

  const handleDelete = () => {
    deleteCard(card.id);
    setOpenDelete(false);
  };

  return (
    <>
      <MuiCard variant="outlined">
        <CardContent>
          <Typography variant="subtitle1" color="textSecondary">
            Question:
          </Typography>
          <Typography variant="body1" gutterBottom>
            {card.question}
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Answer:
          </Typography>
          <Typography variant="body1">{card.answer}</Typography>
          {card.category && (
            <Typography variant="caption" color="textSecondary">
              Category: {card.category}
            </Typography>
          )}
          {card.deckId && (
            <Typography variant="caption" color="textSecondary">
              Deck: {card.deckId}
            </Typography>
          )}
        </CardContent>
        <CardActions>
          <Button size="small" onClick={() => setEditingCard(card)}>
            Edit
          </Button>
          <Button size="small" color="error" onClick={() => setOpenDelete(true)}>
            Delete
          </Button>
        </CardActions>
      </MuiCard>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDelete}
        onClose={() => setOpenDelete(false)}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title">Delete Card</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this card? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDelete(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CardItem;
