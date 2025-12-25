// File: ./src/app/WordQuest/Card/Manager/CardManager.tsx

import { Alert, Box, Paper, Snackbar, useTheme } from '@mui/material';
import React, { useState } from 'react';

import { useCards } from '../CardContext';
import { Card } from '../types';
import CardForm from './CardForm';
import CardList from './CardList';

const CardManager: React.FC = () => {
  const theme = useTheme();
  const { cards, addCard, updateCard, deleteCard } = useCards();
  const [editingCard, setEditingCard] = useState<Card | null>(null);
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

  const handleAddCard = (card: Omit<Card, 'id'>) => {
    addCard(card);
    showNotification('Card added successfully!', 'success');
  };

  const handleUpdateCard = (updatedCard: Card) => {
    updateCard(updatedCard);
    setEditingCard(null);
    showNotification('Card updated successfully!', 'success');
  };

  const handleDeleteCard = (id: string) => {
    deleteCard(id);
    showNotification('Card deleted successfully!', 'success');
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
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
        <CardForm addCard={handleAddCard} editingCard={editingCard} updateCard={handleUpdateCard} />
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
        <CardList cards={cards} setEditingCard={setEditingCard} deleteCard={handleDeleteCard} />
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

export default CardManager;
