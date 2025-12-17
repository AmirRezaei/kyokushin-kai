// File: ./src/app/WordQuest/FlashCard/Deck/DeckForm.tsx

import {Button, Grid, Paper, TextField, Typography} from '@mui/material';
import React, {useEffect, useState} from 'react';

import {Deck} from '../types';

interface DeckFormProps {
   addDeck: (deck: Omit<Deck, 'id' | 'flashCardIds'>) => void;
   editingDeck: Deck | null;
   updateDeck: (deck: Deck) => void;
   cancelEdit: () => void;
}

const DeckForm: React.FC<DeckFormProps> = ({addDeck, editingDeck, updateDeck, cancelEdit}) => {
   const [name, setName] = useState<string>('');
   const [description, setDescription] = useState<string>('');

   useEffect(() => {
      if (editingDeck) {
         setName(editingDeck.name);
         setDescription(editingDeck.description || '');
      } else {
         setName('');
         setDescription('');
      }
   }, [editingDeck]);

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();

      if (editingDeck) {
         updateDeck({
            ...editingDeck,
            name: name.trim(),
            description: description.trim() || undefined,
         });
      } else {
         addDeck({
            name: name.trim(),
            description: description.trim() || undefined,
         });
      }

      // Reset form
      setName('');
      setDescription('');
   };

   return (
      <Paper elevation={3} sx={{p: 3}}>
         <Typography variant='h6' gutterBottom>
            {editingDeck ? 'Edit Deck' : 'Add New Deck'}
         </Typography>
         <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
               <Grid item xs={12}>
                  <TextField label='Deck Name' variant='outlined' fullWidth required value={name} onChange={e => setName(e.target.value)} />
               </Grid>
               <Grid item xs={12}>
                  <TextField label='Description (Optional)' variant='outlined' fullWidth multiline rows={3} value={description} onChange={e => setDescription(e.target.value)} />
               </Grid>

               <Grid item xs={12} sx={{textAlign: 'right'}}>
                  {editingDeck && (
                     <Button
                        variant='outlined'
                        sx={{mr: 2}}
                        onClick={() => {
                           cancelEdit();
                        }}>
                        Cancel
                     </Button>
                  )}
                  <Button type='submit' variant='contained' color='primary'>
                     {editingDeck ? 'Update Deck' : 'Add Deck'}
                  </Button>
               </Grid>
            </Grid>
         </form>
      </Paper>
   );
};

export default DeckForm;
