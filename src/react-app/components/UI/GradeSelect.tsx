// HEADER-START
// * Path: ./src/components/UI/GradeSelect.tsx
// HEADER-END
import {Box, MenuItem, Select, SelectChangeEvent} from '@mui/material';
import React from 'react';

import { getBeltColorHex, getBeltName, getStripeNumber } from '../../../data/repo/gradeHelpers';
import KarateBelt from '../UI/KarateBelt';
import { useCurriculumGrades } from '@/hooks/useCatalog';

interface GradeSelectProps {
   selectedGradeId: string;
   handleGradeChange: (event: SelectChangeEvent<string>) => void;
}

const GradeSelect: React.FC<GradeSelectProps> = ({selectedGradeId, handleGradeChange}) => {
   const { grades } = useCurriculumGrades();

   return (
   <Select labelId='grade-select-label' id='grade-select' value={selectedGradeId} onChange={handleGradeChange} label='Grade'>
      {grades.map((grade) => {
         const beltName = getBeltName(grade);
         const rankName = grade.name.en || grade.name.romaji || 'Unknown';
         const stripes = getStripeNumber(grade);
         const beltColorHex = getBeltColorHex(grade.beltColor);

         return (
         <MenuItem key={grade.id} value={grade.id}>
            <Box display='flex' alignItems='center'>
               <KarateBelt
                  sx={{
                     width: {xs: '2em', sm: '2.5em'},
                     height: {xs: '1em', sm: '1.0em'},
                     mr: 2,
                  }}
                  color={beltColorHex}
                  thickness={5}
                  stripes={stripes}
                  borderRadius='10%'
               />
               {`${rankName} (${beltName})`}
            </Box>
         </MenuItem>
      )})}
   </Select>
   );
};

export default GradeSelect;
