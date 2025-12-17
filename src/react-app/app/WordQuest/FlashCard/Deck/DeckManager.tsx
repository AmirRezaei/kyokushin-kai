// File: ./src/app/WordQuest/FlashCard/Deck/DeckManager.tsx

import {Alert, Box, Container, Snackbar, Typography} from '@mui/material';
import React, {useState} from 'react';

import {Deck} from '../types';
import {useDecks} from './DeckContext';
import DeckForm from './DeckForm';
import DeckList from './DeckList';

const DeckManager: React.FC = () => {
   const {decks, addDeck, updateDeck, deleteDeck} = useDecks();
   const [editingDeck, setEditingDeck] = useState<Deck | null>(null);
   const [notification, setNotification] = useState<{
      open: boolean;
      message: string;
      severity: 'success' | 'error';
   }>({open: false, message: '', severity: 'success'});

   const showNotification = (message: string, severity: 'success' | 'error') => {
      setNotification({open: true, message, severity});
   };

   const handleCloseNotification = (event?: React.SyntheticEvent | Event, reason?: string) => {
      if (reason === 'clickaway') {
         return;
      }
      setNotification(prev => ({...prev, open: false}));
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
      <Container maxWidth='md' sx={{mt: 5, mb: 5}}>
         <Typography variant='h4' align='center' gutterBottom>
            Deck Manager
         </Typography>
         <Box sx={{mt: 4}}>
            <DeckForm addDeck={handleAddDeck} editingDeck={editingDeck} updateDeck={handleUpdateDeck} cancelEdit={cancelEdit} />
         </Box>
         <Box sx={{mt: 4}}>
            <DeckList decks={decks} setEditingDeck={setEditingDeck} deleteDeck={handleDeleteDeck} />
         </Box>
         <Snackbar open={notification.open} autoHideDuration={3000} onClose={handleCloseNotification} anchorOrigin={{vertical: 'bottom', horizontal: 'center'}}>
            <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{width: '100%'}}>
               {notification.message}
            </Alert>
         </Snackbar>
      </Container>
   );
};

export default DeckManager;
