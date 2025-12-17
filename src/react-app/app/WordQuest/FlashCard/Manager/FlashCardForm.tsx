// File: ./src/app/WordQuest/FlashCard/Manager/FlashCardForm.tsx

import {Button, FormControl, Grid, InputLabel, MenuItem, Paper, Select, TextField, Typography} from '@mui/material';
import React, {useEffect, useState} from 'react';

import {Deck, FlashCard} from '../types';

interface FlashCardFormProps {
   addFlashCard: (card: Omit<FlashCard, 'id'>) => void;
   editingCard: FlashCard | null;
   updateFlashCard: (card: FlashCard) => void;
}

const FlashCardForm: React.FC<FlashCardFormProps> = ({addFlashCard, editingCard, updateFlashCard}) => {
   const [question, setQuestion] = useState<string>('');
   const [answer, setAnswer] = useState<string>('');
   const [category, setCategory] = useState<string>('');
   const [deckId, setDeckId] = useState<string>('All');
   const [decks, setDecks] = useState<Deck[]>([]);

   useEffect(() => {
      // Load decks from localStorage
      const storedDecks = JSON.parse(localStorage.getItem('decks') || '[]') as Deck[];
      setDecks(storedDecks);
   }, []);

   useEffect(() => {
      if (editingCard) {
         setQuestion(editingCard.question);
         setAnswer(editingCard.answer);
         setCategory(editingCard.category || '');
         setDeckId(editingCard.deckId || 'All');
      } else {
         setQuestion('');
         setAnswer('');
         setCategory('');
         setDeckId('All');
      }
   }, [editingCard]);

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();

      if (editingCard) {
         updateFlashCard({
            ...editingCard,
            question: question.trim(),
            answer: answer.trim(),
            category: category.trim() || undefined,
            deckId: deckId !== 'All' ? deckId : undefined,
         });
      } else {
         addFlashCard({
            question: question.trim(),
            answer: answer.trim(),
            category: category.trim() || undefined,
            deckId: deckId !== 'All' ? deckId : undefined,
         });
      }

      // Reset form
      setQuestion('');
      setAnswer('');
      setCategory('');
      setDeckId('All');
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
                  <FormControl variant='outlined' fullWidth>
                     <InputLabel id='deck-select-label'>Deck (Optional)</InputLabel>
                     <Select labelId='deck-select-label' id='deck-select' value={deckId} onChange={e => setDeckId(e.target.value as string)} label='Deck (Optional)'>
                        <MenuItem value='All'>None</MenuItem>
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
                           setDeckId('All');
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
