// File: ./src/app/WordQuest/FlashCard/Manager/FlashCardManager.tsx

import {Alert, Box, Container, Snackbar, Typography} from '@mui/material';
import React, {useState} from 'react';

import {useFlashCards} from '../FlashCardContext';
import {FlashCard} from '../types';
import FlashCardForm from './FlashCardForm';
import FlashCardList from './FlashCardList';

const FlashCardManager: React.FC = () => {
   const {flashCards, addFlashCard, updateFlashCard, deleteFlashCard} = useFlashCards();
   const [editingCard, setEditingCard] = useState<FlashCard | null>(null);
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
      <Container maxWidth='md' sx={{mt: 5, mb: 5}}>
         <Typography variant='h4' align='center' gutterBottom>
            Flash Card Manager
         </Typography>
         <Box sx={{mt: 4}}>
            <FlashCardForm addFlashCard={handleAddFlashCard} editingCard={editingCard} updateFlashCard={handleUpdateFlashCard} />
         </Box>
         <Box sx={{mt: 4}}>
            <FlashCardList flashCards={flashCards} setEditingCard={setEditingCard} deleteFlashCard={handleDeleteFlashCard} />
         </Box>
         <Snackbar open={notification.open} autoHideDuration={3000} onClose={handleCloseNotification} anchorOrigin={{vertical: 'bottom', horizontal: 'center'}}>
            <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{width: '100%'}}>
               {notification.message}
            </Alert>
         </Snackbar>
      </Container>
   );
};

export default FlashCardManager;
