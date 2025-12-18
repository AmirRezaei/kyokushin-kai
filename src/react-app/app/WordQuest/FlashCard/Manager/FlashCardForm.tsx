// File: ./src/app/WordQuest/FlashCard/Manager/FlashCardForm.tsx

import {Button, FormControl, Grid, InputLabel, MenuItem, Paper, Select, TextField, Typography} from '@mui/material';
import React, {useEffect, useState} from 'react';

import {FlashCard} from '../types';

interface FlashCardFormProps {
   addFlashCard: (card: Omit<FlashCard, 'id'>) => void;
   editingCard: FlashCard | null;
   updateFlashCard: (card: FlashCard) => void;
}

import {useDecks} from '../Deck/DeckContext';

// ...

const FlashCardForm: React.FC<FlashCardFormProps> = ({addFlashCard, editingCard, updateFlashCard}) => {
   const [question, setQuestion] = useState<string>('');
   const [answer, setAnswer] = useState<string>('');
   const [category, setCategory] = useState<string>('');
   const [deckId, setDeckId] = useState<string>(''); // Default to empty
   const { decks } = useDecks();

   useEffect(() => {
      if (editingCard) {
         setQuestion(editingCard.question);
         setAnswer(editingCard.answer);
         setCategory(editingCard.category || '');
         setDeckId(editingCard.deckId || '');
      } else {
         setQuestion('');
         setAnswer('');
         setCategory('');
         // Default to first deck if available, else empty
         setDeckId(decks.length > 0 ? decks[0].id : '');
      }
   }, [editingCard, decks]); // Re-run if decks load later

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();

      if (!deckId || deckId === 'All') {
          // Should be handled by required attribute or validation, but safety check
          alert('Please select a deck.'); 
          return;
      }

      if (editingCard) {
         updateFlashCard({
            ...editingCard,
            question: question.trim(),
            answer: answer.trim(),
            category: category.trim() || undefined,
            deckId: deckId,
         });
      } else {
         addFlashCard({
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
      <Paper elevation={3} sx={{p: 3}}>
         <Typography variant='h6' gutterBottom>
            {editingCard ? 'Edit Flashcard' : 'Add New Flashcard'}
         </Typography>
         <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
               <Grid item xs={12}>
                  <TextField label='Question' variant='outlined' fullWidth required value={question} onChange={e => setQuestion(e.target.value)} />
               </Grid>
               <Grid item xs={12}>
                  <TextField label='Answer' variant='outlined' fullWidth required value={answer} onChange={e => setAnswer(e.target.value)} />
               </Grid>
               <Grid item xs={12}>
                  <TextField label='Category (Optional)' variant='outlined' fullWidth value={category} onChange={e => setCategory(e.target.value)} />
               </Grid>
               <Grid item xs={12}>
                  <FormControl variant='outlined' fullWidth required>
                     <InputLabel id='deck-select-label'>Deck</InputLabel>
                     <Select labelId='deck-select-label' id='deck-select' value={deckId} onChange={e => setDeckId(e.target.value as string)} label='Deck'>
                        {decks.map(deck => (
                           <MenuItem key={deck.id} value={deck.id}>
                              {deck.name}
                           </MenuItem>
                        ))}
                     </Select>
                  </FormControl>
               </Grid>

               <Grid item xs={12} sx={{textAlign: 'right'}}>
                  {editingCard && (
                     <Button
                        variant='outlined'
                        sx={{mr: 2}}
                        onClick={() => {
                           // Reset editing
                           setQuestion('');
                           setAnswer('');
                           setCategory('');
                           setDeckId(decks.length > 0 ? decks[0].id : '');
                        }}>
                        Cancel
                     </Button>
                  )}
                  <Button type='submit' variant='contained' color='primary'>
                     {editingCard ? 'Update Flashcard' : 'Add Flashcard'}
                  </Button>
               </Grid>
            </Grid>
         </form>
      </Paper>
   );
};

export default FlashCardForm;
