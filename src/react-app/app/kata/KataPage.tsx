// HEADER-START
// * Path: ./src/app/kata/KataPage.tsx
// HEADER-END

import {Typography} from '@mui/material';
import Box from '@mui/material/Box';
import React, {useMemo} from 'react';

import KarateBelt from '@/components/UI/KarateBelt';
import { KyokushinRepository } from '../../../data/repo/KyokushinRepository';
import { getBeltColorHex, getStripeNumber } from '../../../data/repo/gradeHelpers';
import { KataRecord } from '../../../data/model/kata';

const KataPage: React.FC = () => {
   const grades = useMemo(() => KyokushinRepository.getCurriculumGrades(), []);

   const handleKataClick = (kata: KataRecord) => {
      if (kata.mediaIds && kata.mediaIds.length > 0) {
          const media = KyokushinRepository.getMedia(kata.mediaIds[0]);
          if (media && media.url) {
              window.open(media.url, '_blank', 'noopener,noreferrer');
          }
      }
   };

   return (
      <Box
         sx={{
            display: 'block',
            flexWrap: 'wrap',
            justifyContent: 'flex-start',
            gap: 0,
         }}>
         {grades.map((grade) => (
            <React.Fragment key={grade.id}>
               <KarateBelt 
                    sx={{m: 0, width: '100%', height: '1.5em', alignItems: 'flex-end'}} 
                    borderRadius='0' 
                    borderWidth='0.1em' 
                    thickness={'0.5em'} 
                    stripes={getStripeNumber(grade)} 
                    color={getBeltColorHex(grade.beltColor)} 
               />

               {grade.katas.map((kata) => {
                  return (
                     <Box 
                        key={kata.id} 
                        onClick={() => handleKataClick(kata)}
                        sx={{ cursor: (kata.mediaIds?.length ?? 0) > 0 ? 'pointer' : 'default' }}
                     >
                        <Typography
                           gutterBottom
                           variant='h5'
                           sx={{
                              pr: 2, // Add right padding
                              mt: 2, // Add top margin
                              color: 'text.primary',
                              textAlign: 'left',
                              '&:hover': {
                                  color: (kata.mediaIds?.length ?? 0) > 0 ? 'primary.main' : 'text.primary'
                              }
                           }}>
                           {kata.name.ja || kata.name.romaji}
                        </Typography>
                        <Typography
                           variant='h6'
                           color='text.secondary'
                           sx={{
                              pr: 2,
                              color: 'text.secondary',
                              textAlign: 'left', // Align text to right
                           }}>
                           {kata.name.en || kata.detailedDescription?.en || ''}
                        </Typography>
                     </Box>
                  );
               })}
            </React.Fragment>
         ))}
      </Box>
   );
};

export default KataPage;
