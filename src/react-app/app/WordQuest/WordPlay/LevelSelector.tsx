// HEADER-START
// * Path: ./src/app/WordQuest/wordPlay/LevelSelector.tsx
// HEADER-END

'use client';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import {Box, MenuItem, Select, SelectChangeEvent, Typography} from '@mui/material';
import React from 'react';

import KarateBelt from '@/components/UI/KarateBelt';
import {Grade} from '@/data/Grade';

interface LevelSelectorProps {
   grades: Grade[];
   selectedLevel: number;
   handleLevelChange: (event: SelectChangeEvent<number>) => void;
   knownTechniqueIds: Set<string>;
}

const LevelSelector: React.FC<LevelSelectorProps> = ({grades, selectedLevel, handleLevelChange, knownTechniqueIds}) => {
   return (
      <Box sx={{mt: 2, mb: 2}}>
         <Typography variant='h6'>Select Level:</Typography>
         <Select
            value={selectedLevel}
            onChange={handleLevelChange}
            renderValue={value => {
               const grade = grades.find(g => g.levelNumber === value)!;
               const isCompleted = grade.techniques.every(tech => knownTechniqueIds.has(tech.id));
               return (
                  <Box display='flex' alignItems='center' width='100%'>
                     <KarateBelt sx={{width: '3em', height: '1em', mr: '1em'}} color={grade.beltColor} thickness={'0.3em'} borderWidth='1px' stripes={grade.stripeNumber} borderRadius='1' />

                     <Typography>{`${grade.rankName} - ${grade.beltName}`}</Typography>
                     {isCompleted && <CheckCircleIcon color='success' sx={{ml: 'auto'}} />}
                  </Box>
               );
            }}>
            {grades
               .filter(x => x.hasTechniques)
               .map(grade => {
                  const isCompleted = grade.techniques.every(tech => knownTechniqueIds.has(tech.id));
                  return (
                     <MenuItem key={grade.levelNumber} value={grade.levelNumber}>
                        <Box display='flex' alignItems='center' width='100%'>
                           <KarateBelt sx={{width: '3em', height: '1em', mr: '1em'}} color={grade.beltColor} thickness={'0.3em'} borderWidth='1px' stripes={grade.stripeNumber} borderRadius='1' />

                           <Typography>{`${grade.rankName} - ${grade.beltName}`}</Typography>
                           {isCompleted && <CheckCircleIcon color='success' sx={{ml: 'auto'}} />}
                        </Box>
                     </MenuItem>
                  );
               })}
         </Select>
      </Box>
   );
};

export default LevelSelector;
