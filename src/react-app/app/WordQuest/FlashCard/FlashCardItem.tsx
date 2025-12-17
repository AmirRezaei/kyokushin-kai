// File: ./src/app/WordQuest/FlashCard/FlashCardItem.tsx

import {Button, Card, CardActions, CardContent, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Typography} from '@mui/material';
import React, {useState} from 'react';

import {FlashCard} from './types';

interface FlashCardItemProps {
   card: FlashCard;
   setEditingCard: (card: FlashCard) => void;
   deleteFlashCard: (id: string) => void;
}

const FlashCardItem: React.FC<FlashCardItemProps> = ({card, setEditingCard, deleteFlashCard}) => {
   const [openDelete, setOpenDelete] = useState<boolean>(false);

   const handleDelete = () => {
      deleteFlashCard(card.id);
      setOpenDelete(false);
   };

   return (
      <>
         <Card variant='outlined'>
            <CardContent>
               <Typography variant='subtitle1' color='textSecondary'>
                  Question:
               </Typography>
               <Typography variant='body1' gutterBottom>
                  {card.question}
               </Typography>
               <Typography variant='subtitle1' color='textSecondary'>
                  Answer:
               </Typography>
               <Typography variant='body1'>{card.answer}</Typography>
               {card.category && (
                  <Typography variant='caption' color='textSecondary'>
                     Category: {card.category}
                  </Typography>
               )}
               {card.deckId && (
                  <Typography variant='caption' color='textSecondary'>
                     Deck: {card.deckId}
                  </Typography>
               )}
            </CardContent>
            <CardActions>
               <Button size='small' onClick={() => setEditingCard(card)}>
                  Edit
               </Button>
               <Button size='small' color='error' onClick={() => setOpenDelete(true)}>
                  Delete
               </Button>
            </CardActions>
         </Card>

         {/* Delete Confirmation Dialog */}
         <Dialog open={openDelete} onClose={() => setOpenDelete(false)} aria-labelledby='delete-dialog-title'>
            <DialogTitle id='delete-dialog-title'>Delete Flashcard</DialogTitle>
            <DialogContent>
               <DialogContentText>Are you sure you want to delete this flashcard? This action cannot be undone.</DialogContentText>
            </DialogContent>
            <DialogActions>
               <Button onClick={() => setOpenDelete(false)}>Cancel</Button>
               <Button onClick={handleDelete} color='error'>
                  Delete
               </Button>
            </DialogActions>
         </Dialog>
      </>
   );
};

export default FlashCardItem;
