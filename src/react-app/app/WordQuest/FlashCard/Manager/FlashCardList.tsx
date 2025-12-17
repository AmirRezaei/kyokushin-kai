// File: ./src/app/WordQuest/FlashCard/Manager/FlashCardList.tsx

import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography} from '@mui/material';
import React, {useEffect, useState} from 'react';

import {useDecks} from '../Deck/DeckContext';
import FlashCardItem from '../FlashCardItem';
import {Deck, FlashCard} from '../types';

interface FlashCardListProps {
   flashCards: FlashCard[];
   setEditingCard: (card: FlashCard) => void;
   deleteFlashCard: (id: string) => void;
}

const FlashCardList: React.FC<FlashCardListProps> = ({flashCards, setEditingCard, deleteFlashCard}) => {
   const { decks } = useDecks();

   const getDeckName = (deckId?: string) => {
      if (!deckId) return 'None';
      const deck = decks.find(d => d.id === deckId);
      return deck ? deck.name : 'Unknown';
   };

   return (
      <div>
         <Typography variant='h5' gutterBottom>
            Existing Flashcards
         </Typography>
         {flashCards.length === 0 ? (
            <Typography variant='body1'>No flashcards available.</Typography>
         ) : (
            <TableContainer component={Paper}>
               <Table aria-label='flashcard table'>
                  <TableHead>
                     <TableRow>
                        <TableCell>Question</TableCell>
                        <TableCell>Answer</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell>Deck</TableCell>
                        <TableCell align='right'>Actions</TableCell>
                     </TableRow>
                  </TableHead>
                  <TableBody>
                     {flashCards.map(card => (
                        <TableRow key={card.id}>
                           <TableCell>{card.question}</TableCell>
                           <TableCell>{card.answer}</TableCell>
                           <TableCell>{card.category}</TableCell>
                           <TableCell>{getDeckName(card.deckId)}</TableCell>
                           <TableCell align='right'>
                              {!card.id.startsWith('card-tech-') && (
                                 <>
                                    <IconButton color='primary' onClick={() => setEditingCard(card)}>
                                       <EditIcon />
                                    </IconButton>
                                    <IconButton color='secondary' onClick={() => deleteFlashCard(card.id)}>
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

export default FlashCardList;
