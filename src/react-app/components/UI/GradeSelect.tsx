// HEADER-START
// * Path: ./src/components/UI/GradeSelect.tsx
// HEADER-END
import {Box, MenuItem, Select, SelectChangeEvent} from '@mui/material';
import React from 'react';

import {Grade} from '@/data/Grade';

import {gradeData} from '../../data/gradeData';
import KarateBelt from '../UI/KarateBelt';

interface GradeSelectProps {
   selectedGradeId: string;
   handleGradeChange: (event: SelectChangeEvent<string>) => void;
}

const GradeSelect: React.FC<GradeSelectProps> = ({selectedGradeId, handleGradeChange}) => (
   <Select labelId='grade-select-label' id='grade-select' value={selectedGradeId} onChange={handleGradeChange} label='Grade'>
      {gradeData.map((grade: Grade) => (
         <MenuItem key={grade.id} value={grade.id}>
            <Box display='flex' alignItems='center'>
               <KarateBelt
                  sx={{
                     width: {xs: '2em', sm: '2.5em'},
                     height: {xs: '1em', sm: '1.0em'},
                     mr: 2,
                  }}
                  color={grade.beltColor}
                  thickness={5}
                  stripes={grade.stripeNumber}
                  borderRadius='10%'
               />
               {`${grade.rankName} (${grade.beltName})`}
            </Box>
         </MenuItem>
      ))}
   </Select>
);

export default GradeSelect;
