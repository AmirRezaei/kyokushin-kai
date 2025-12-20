// File: ./src/app/WordQuest/FlashCard/Manager/FlashCardManager.tsx

import { Alert, Box, Paper, Snackbar, Typography, useTheme } from '@mui/material';
import React, { useState } from 'react';

import { useFlashCards } from '../FlashCardContext';
import { FlashCard } from '../types';
import FlashCardForm from './FlashCardForm';
import FlashCardList from './FlashCardList';

const FlashCardManager: React.FC = () => {
  const theme = useTheme();
  const { flashCards, addFlashCard, updateFlashCard, deleteFlashCard } = useFlashCards();
  const [editingCard, setEditingCard] = useState<FlashCard | null>(null);
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

  const handleAddFlashCard = (card: Omit<FlashCard, 'id'>) => {
    addFlashCard(card);
    showNotification('Flashcard added successfully!', 'success');
  };

  const handleUpdateFlashCard = (updatedCard: FlashCard) => {
    updateFlashCard(updatedCard);
    setEditingCard(null);
    showNotification('Flashcard updated successfully!', 'success');
  };

  const handleDeleteFlashCard = (id: string) => {
    deleteFlashCard(id);
    showNotification('Flashcard deleted successfully!', 'success');
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
          Flash Card Manager
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: theme.palette.primary.contrastText, opacity: 0.9, mt: theme.spacing(0.5) }}
        >
          Create and manage your flashcards
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
        <FlashCardForm
          addFlashCard={handleAddFlashCard}
          editingCard={editingCard}
          updateFlashCard={handleUpdateFlashCard}
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
        <FlashCardList
          flashCards={flashCards}
          setEditingCard={setEditingCard}
          deleteFlashCard={handleDeleteFlashCard}
        />
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

export default FlashCardManager;
