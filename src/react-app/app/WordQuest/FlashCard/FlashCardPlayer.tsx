// File: ./src/app/WordQuest/FlashCard/FlashCardPlayer.tsx

import {ArrowBack, ArrowForward, Flip, Shuffle} from '@mui/icons-material';
import {Box, Button, FormControl, IconButton, InputLabel, MenuItem, Select, SelectChangeEvent, Stack, Typography} from '@mui/material';
import {useTheme} from '@mui/material/styles';
import React, {useEffect, useState} from 'react';

import {useDecks} from './Deck/DeckContext';
import {useFlashCards} from './FlashCardContext';
import {FlashCard} from './types';
import CategorySelect from './UI/CategorySelect';
import FlipCardBack from './UI/FlipCardBack';
import FlipCardContainer from './UI/FlipCardContainer';
import FlipCardFace from './UI/FlipCardFace';
import FlipCardInner from './UI/FlipCardInner';
import {LinearProgressWithLabel} from './UI/LinearProgressWithLabel';

const FlashCardPlayer: React.FC = () => {
   const theme = useTheme();
   const {decks} = useDecks();
   const {flashCards} = useFlashCards();
   const [currentIndex, setCurrentIndex] = useState<number>(0);
   const [flipped, setFlipped] = useState<boolean>(false);
   const [selectedDeckId, setSelectedDeckId] = useState<string>('All');
   const [selectedCategory, setSelectedCategory] = useState<string>('All');
   const [orderedFlashCards, setOrderedFlashCards] = useState<FlashCard[]>([]);

   /**
    * Update orderedFlashCards based on selected deck and category.
    */
   useEffect(() => {
      let filtered = flashCards;
      if (selectedDeckId !== 'All') {
         filtered = filtered.filter(card => card.deckId === selectedDeckId);
      }
      if (selectedCategory !== 'All') {
         filtered = filtered.filter(card => card.category === selectedCategory);
      }
      setOrderedFlashCards(filtered);
      setCurrentIndex(0);
      setFlipped(false);
   }, [flashCards, selectedDeckId, selectedCategory]);

   /**
    * Shuffle the ordered flashcards.
    */
   const shuffleFlashCards = () => {
      const shuffled = [...orderedFlashCards].sort(() => Math.random() - 0.5);
      setOrderedFlashCards(shuffled);
      setCurrentIndex(0);
      setFlipped(false);
   };

   /**
    * Handle flipping the current flashcard.
    */
   const handleFlip = () => {
      setFlipped(prev => !prev);
   };

   /**
    * Navigate to the next flashcard.
    */
   const handleNext = () => {
      setFlipped(false);
      setCurrentIndex(prev => (prev + 1) % orderedFlashCards.length);
   };

   /**
    * Navigate to the previous flashcard.
    */
   const handlePrev = () => {
      setFlipped(false);
      setCurrentIndex(prev => (prev === 0 ? orderedFlashCards.length - 1 : prev - 1));
   };

   /**
    * Handle deck selection change for filtering.
    */
   const handleDeckChange = (event: SelectChangeEvent<string>) => {
      setSelectedDeckId(event.target.value as string);
   };

   /**
    * Handle category selection change for filtering.
    */
   const handleCategoryChange = (event: SelectChangeEvent<string>) => {
      setSelectedCategory(event.target.value as string);
   };

   // Get deck options
   const deckOptions: {id: string; name: string}[] = decks.map(deck => ({
      id: deck.id,
      name: deck.name,
   }));

   if (orderedFlashCards.length === 0) {
      return (
         <Box>
            <Typography variant='h6' align='center'>
               No flashcards available for the selected deck and category. Please add some flashcards and assign them to decks and categories in the Manager.
            </Typography>
            <Box sx={{display: 'flex', justifyContent: 'center', mt: 2, gap: 2}}>
               <FormControl variant='outlined' sx={{minWidth: 120}}>
                  <InputLabel id='deck-select-label'>Deck</InputLabel>
                  <Select labelId='deck-select-label' id='deck-select' value={selectedDeckId} onChange={handleDeckChange} label='Deck'>
                     <MenuItem value='All'>All</MenuItem>
                     {deckOptions.map(deck => (
                        <MenuItem key={deck.id} value={deck.id}>
                           {deck.name}
                        </MenuItem>
                     ))}
                  </Select>
               </FormControl>
               <CategorySelect handleCategoryChange={handleCategoryChange} selectedCategory={selectedCategory} />
            </Box>
         </Box>
      );
   }

   const progress = ((currentIndex + 1) / orderedFlashCards.length) * 100;
   const currentCard = orderedFlashCards[currentIndex];

   return (
      <Box>
         <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 1}}>
            <Typography variant='body2' color={theme.palette.text.secondary}>
               Card {currentIndex + 1} of {orderedFlashCards.length}
            </Typography>
         </Box>

         <LinearProgressWithLabel value={progress} sx={{height: '1em', borderRadius: 1}} />

         <FlipCardContainer onClick={handleFlip} sx={{mb: 2, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
            <FlipCardInner
               flipped={flipped}
               sx={{
                  position: 'relative',
                  width: '20em',
                  height: '20em',
                  textAlign: 'center',
               }}>
               <FlipCardFace
                  elevation={3}
                  sx={{
                     backgroundColor: theme.palette.primary.main,
                  }}>
                  <Box
                     sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                     }}>
                     <Typography variant='h5' sx={{color: theme.palette.text.primary}}>
                        {currentCard.question}
                     </Typography>
                  </Box>
               </FlipCardFace>
               <FlipCardBack
                  elevation={3}
                  sx={{
                     backgroundColor: theme.palette.secondary.main,
                  }}>
                  <Box
                     sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                     }}>
                     <Typography sx={{mt: '1em', fontWeight: 'bold'}} variant='h5'>
                        {currentCard.answer}
                     </Typography>
                  </Box>
               </FlipCardBack>
            </FlipCardInner>
         </FlipCardContainer>

         <Stack direction='row' spacing={2} sx={{mt: 1, justifyContent: 'center'}}>
            <Button variant='contained' endIcon={<ArrowBack />} onClick={handlePrev} />
            <Button variant='contained' startIcon={<ArrowForward />} onClick={handleNext} />
         </Stack>

         <Box sx={{mt: 2, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2}}>
            <FormControl variant='outlined' sx={{minWidth: 120}}>
               <InputLabel id='deck-select-label'>Deck</InputLabel>
               <Select labelId='deck-select-label' id='deck-select' value={selectedDeckId} onChange={handleDeckChange} label='Deck'>
                  <MenuItem value='All'>All</MenuItem>
                  {deckOptions.map(deck => (
                     <MenuItem key={deck.id} value={deck.id}>
                        {deck.name}
                     </MenuItem>
                  ))}
               </Select>
            </FormControl>
            <CategorySelect handleCategoryChange={handleCategoryChange} selectedCategory={selectedCategory} />
            <IconButton onClick={handleFlip} color='primary'>
               <Flip />
            </IconButton>
            <IconButton onClick={shuffleFlashCards} color='primary'>
               <Shuffle />
            </IconButton>
         </Box>
      </Box>
   );
};

export default FlashCardPlayer;
