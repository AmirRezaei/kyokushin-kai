// File: ./src/app/WordQuest/WordQuestPage.tsx

// HEADER-START
// * Path: ./src/app/WordQuest/WordQuestPage.tsx
// HEADER-END

import {Box, Tab, Tabs} from '@mui/material';
import React, {useState} from 'react';

import FlashCardPage from './FlashCard/FlashCardPage';
import WordPlayPage from './WordPlay/WordPlayPage';

const WordQuestPage: React.FC = () => {
   const [value, setValue] = useState(0);

   const handleChange = (event: React.SyntheticEvent, newValue: number) => {
      setValue(newValue);
   };

   return (
      <Box>
         <Tabs variant='scrollable' value={value} onChange={handleChange} indicatorColor='primary' textColor='primary'>
            <Tab label='WordPlay' />
            <Tab label='Flash Card' />
         </Tabs>
         {value === 0 && <WordPlayPage />}
         {value === 1 && <FlashCardPage />}
      </Box>
   );
};

export default WordQuestPage;