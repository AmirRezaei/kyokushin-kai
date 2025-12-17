// File: ./src/app/WordQuest/FlashCard/FlashCardPage.tsx

import {Box, Tab, Tabs} from '@mui/material';
import React, {useState} from 'react';

import {DeckProvider} from './Deck/DeckContext';
import DeckManager from './Deck/DeckManager';
import {FlashCardProvider} from './FlashCardContext';
import FlashCardPlayer from './FlashCardPlayer';
import FlashCardManager from './Manager/FlashCardManager';

const FlashCardPage: React.FC = () => {
   const [value, setValue] = useState(0);

   const handleChange = (event: React.SyntheticEvent, newValue: number) => {
      setValue(newValue);
   };

   return (
      <Box>
         <DeckProvider>
            <FlashCardProvider>
               <Tabs variant='scrollable' value={value} onChange={handleChange} indicatorColor='primary' textColor='primary'>
                  <Tab label='Play' />
                  <Tab label='Manage Flashcards' />
                  <Tab label='Manage Decks' />
               </Tabs>
               {value === 0 && <FlashCardPlayer />}
               {value === 1 && <FlashCardManager />}
               {value === 2 && <DeckManager />}
            </FlashCardProvider>
         </DeckProvider>
      </Box>
   );
};

export default FlashCardPage;