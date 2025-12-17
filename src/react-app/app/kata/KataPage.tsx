// HEADER-START
// * Path: ./src/app/kata/KataPage.tsx
// HEADER-END

import {Typography, useTheme} from '@mui/material';
import Box from '@mui/material/Box';
import React, {useState} from 'react';

import KarateBelt from '@/components/UI/KarateBelt';
import {gradeData} from '@/data/gradeData';

const KataPage: React.FC = () => {
   const [expandedCard] = useState<{gradeIndex: number; kataIndex: number} | null>(null);
   const theme = useTheme(); // Initialize theme
   const handleCardClick = () => {
      if (expandedCard) {
         window.open(`https://www.youtube.com/watch?v=${gradeData[expandedCard.gradeIndex].katas[expandedCard.kataIndex].youtubeKey}`, '_blank', 'noopener,noreferrer');
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
         {gradeData.map((grade, i) => (
            <React.Fragment key={i}>
               <KarateBelt sx={{m: 0, width: '100%', height: '1.5em', alignItems: 'flex-end'}} borderRadius='0' borderWidth='0.1em' thickness={'0.5em'} stripes={grade.stripeNumber} color={grade.beltColor} />

               {grade.katas.map((kata, j) => {
                  const isExpanded = expandedCard?.gradeIndex === i && expandedCard?.kataIndex === j;
                  return (
                     <Box>
                        <Typography
                           gutterBottom
                           variant='h5'
                           sx={{
                              pr: 2, // Add right padding
                              mt: 2, // Add top margin
                              color: 'text.primary',
                              textAlign: 'left',
                           }}>
                           {kata.japanese}
                        </Typography>
                        <Typography
                           variant='h6'
                           color='text.secondary'
                           sx={{
                              pr: 2,
                              color: 'text.secondary',
                              textAlign: 'left', // Align text to right
                           }}>
                           {kata.description}
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
