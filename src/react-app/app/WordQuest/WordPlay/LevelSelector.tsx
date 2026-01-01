import {Box, MenuItem, Select, SelectChangeEvent, Typography} from '@mui/material';
import React from 'react';

import KarateBelt from '@/components/UI/KarateBelt';
// import {Grade} from '@/data/Grade'; // Removed
import { getFormattedGradeName, getBeltName, getLevelNumber, getStripeNumber } from '../../../../data/repo/gradeHelpers';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { GradeWithContent } from '@/hooks/useCatalog';

interface LevelSelectorProps {
   grades: GradeWithContent[];
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
               const grade = grades.find(g => getLevelNumber(g) === value);
               if (!grade) return null;
               
               const isCompleted = grade.techniques.every(tech => knownTechniqueIds.has(tech.id));
               const rankName = getFormattedGradeName(grade);
               const beltName = getBeltName(grade);
               const stripes = getStripeNumber(grade);
               
               return (
                  <Box display='flex' alignItems='center' width='100%'>
                     <KarateBelt sx={{width: '3em', height: '1em', mr: '1em'}} color={grade.beltColor} thickness={'0.3em'} borderWidth='1px' stripes={stripes} borderRadius='1' />

                     <Typography>{`${rankName} - ${beltName}`}</Typography>
                     {isCompleted && <CheckCircleIcon color='success' sx={{ml: 'auto'}} />}
                  </Box>
               );
            }}>
            {grades
               .filter(x => x.techniques && x.techniques.length > 0)
               .map(grade => {
                  const isCompleted = grade.techniques.every(tech => knownTechniqueIds.has(tech.id));
                  const rankName = getFormattedGradeName(grade);
                  const beltName = getBeltName(grade);
                  const stripes = getStripeNumber(grade);
                  const levelNumber = getLevelNumber(grade);
                  
                  return (
                     <MenuItem key={levelNumber} value={levelNumber}>
                        <Box display='flex' alignItems='center' width='100%'>
                           <KarateBelt sx={{width: '3em', height: '1em', mr: '1em'}} color={grade.beltColor} thickness={'0.3em'} borderWidth='1px' stripes={stripes} borderRadius='1' />

                           <Typography>{`${rankName} - ${beltName}`}</Typography>
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
