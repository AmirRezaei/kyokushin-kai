// File: ./src/app/WordQuest/FlashCard/Deck/DeckList.tsx

import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography} from '@mui/material';
import React from 'react';

import {Deck} from '../types';

interface DeckListProps {
   decks: Deck[];
   setEditingDeck: (deck: Deck) => void;
   deleteDeck: (id: string) => void;
}

const DeckList: React.FC<DeckListProps> = ({decks, setEditingDeck, deleteDeck}) => {
   return (
      <div>
         <Typography variant='h5' gutterBottom>
            Existing Decks
         </Typography>
         {decks.length === 0 ? (
            <Typography variant='body1'>No decks available.</Typography>
         ) : (
            <TableContainer component={Paper}>
               <Table aria-label='deck table'>
                  <TableHead>
                     <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell align='right'>Actions</TableCell>
                     </TableRow>
                  </TableHead>
                  <TableBody>
                     {decks.map(deck => (
                        <TableRow key={deck.id}>
                           <TableCell>{deck.name}</TableCell>
                           <TableCell>{deck.description}</TableCell>
                           <TableCell align='right'>
                              {!deck.id.startsWith('deck-') && (
                                 <>
                                    <IconButton color='primary' onClick={() => setEditingDeck(deck)}>
                                       <EditIcon />
                                    </IconButton>
                                    <IconButton color='secondary' onClick={() => deleteDeck(deck.id)}>
                                       <DeleteIcon />
                                    </IconButton>
                                 </>
                              )}
                           </TableCell>
                        </TableRow>
                     ))}
                  </TableBody>
               </Table>
            </TableContainer>
         )}
      </div>
   );
};

export default DeckList;
