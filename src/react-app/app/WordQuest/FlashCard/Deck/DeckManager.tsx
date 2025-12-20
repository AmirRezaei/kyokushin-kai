// File: ./src/app/WordQuest/FlashCard/Deck/DeckManager.tsx

import { Alert, Box, Paper, Snackbar, Typography, useTheme } from '@mui/material';
import React, { useState } from 'react';

import { Deck } from '../types';
import { useDecks } from './DeckContext';
import DeckForm from './DeckForm';
import DeckList from './DeckList';

const DeckManager: React.FC = () => {
  const theme = useTheme();
  const { decks, addDeck, updateDeck, deleteDeck } = useDecks();
  const [editingDeck, setEditingDeck] = useState<Deck | null>(null);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const showNotification = (message: string, severity: 'success' | 'error') => {
    setNotification({ open: true, message, severity });
  };

  const handleCloseNotification = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setNotification((prev) => ({ ...prev, open: false }));
  };

  const cancelEdit = () => {
    setEditingDeck(null);
  };

  const handleAddDeck = (deck: Omit<Deck, 'id' | 'flashCardIds'>) => {
    addDeck(deck);
    showNotification('Deck added successfully!', 'success');
  };

  const handleUpdateDeck = (updatedDeck: Deck) => {
    updateDeck(updatedDeck);
    setEditingDeck(null);
    showNotification('Deck updated successfully!', 'success');
  };

  const handleDeleteDeck = (id: string) => {
    deleteDeck(id);
    showNotification('Deck deleted successfully!', 'success');
  };

  return (
    <Box>
      {/* Header */}
      <Paper
        elevation={2}
        sx={{
          mb: theme.spacing(3),
          p: theme.spacing(3),
          textAlign: 'center',
          borderRadius: theme.spacing(2),
          background: theme.palette.primary.main,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            color: theme.palette.primary.contrastText,
          }}
        >
          Deck Manager
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: theme.palette.primary.contrastText, opacity: 0.9, mt: theme.spacing(0.5) }}
        >
          Organize your flashcards into decks
        </Typography>
      </Paper>

      {/* Form Section */}
      <Paper
        elevation={2}
        sx={{
          mb: theme.spacing(3),
          p: theme.spacing(3),
          borderRadius: theme.spacing(3),
          background:
            theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <DeckForm
          addDeck={handleAddDeck}
          editingDeck={editingDeck}
          updateDeck={handleUpdateDeck}
          cancelEdit={cancelEdit}
        />
      </Paper>

      {/* List Section */}
      <Paper
        elevation={2}
        sx={{
          p: theme.spacing(3),
          borderRadius: theme.spacing(3),
          background:
            theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <DeckList decks={decks} setEditingDeck={setEditingDeck} deleteDeck={handleDeleteDeck} />
      </Paper>

      <Snackbar
        open={notification.open}
        autoHideDuration={3000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DeckManager;
