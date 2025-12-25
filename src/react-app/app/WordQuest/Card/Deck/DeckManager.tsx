// File: ./src/app/WordQuest/Card/Deck/DeckManager.tsx

import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Snackbar,
  useTheme,
} from '@mui/material';
import React, { useState } from 'react';

import { Deck } from '../types';
import { useDecks } from './DeckContext';
import DeckForm from './DeckForm';
import DeckList from './DeckList';

const DeckManager: React.FC = () => {
  const theme = useTheme();
  const { decks, addDeck, updateDeck, deleteDeck, deleteAllDecks } = useDecks();
  const [editingDeck, setEditingDeck] = useState<Deck | null>(null);
  const [openDeleteAllDialog, setOpenDeleteAllDialog] = useState(false);
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

  const handleAddDeck = (deck: Omit<Deck, 'id' | 'cardIds'>) => {
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

  const handleConfirmDeleteAll = () => {
    deleteAllDecks();
    setOpenDeleteAllDialog(false);
    showNotification('All user decks deleted successfully!', 'success');
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
        {decks.some((d) => !d.id.startsWith('deck-')) && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              variant="outlined"
              color="error"
              onClick={() => setOpenDeleteAllDialog(true)}
              size="small"
            >
              Delete All Custom Decks
            </Button>
          </Box>
        )}
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

      <Dialog open={openDeleteAllDialog} onClose={() => setOpenDeleteAllDialog(false)}>
        <DialogTitle>Delete All Custom Decks?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete all your custom decks? This action cannot be undone.
            System decks will remain.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteAllDialog(false)}>Cancel</Button>
          <Button onClick={handleConfirmDeleteAll} color="error" autoFocus>
            Delete All
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DeckManager;
