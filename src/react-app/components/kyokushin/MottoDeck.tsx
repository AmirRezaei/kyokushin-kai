// File: ./src/components/kyokushin/ElevenMottosPage.tsx
import {ArrowBackIos, ArrowForwardIos, Close} from '@mui/icons-material';
import {Box, Card, CardActions, CardContent, IconButton, Paper, Typography} from '@mui/material';
import React, {useState} from 'react';

import {KYOKUSHIN_MOTTOS} from '../../app/motto/constants';

interface ElevenMottosPageProps {
   onClose: () => void;
}

const MottoDeck: React.FC<ElevenMottosPageProps> = ({onClose}) => {
   const [currentIndex, setCurrentIndex] = useState(0);

   const handleNext = () => {
      setCurrentIndex(prev => (prev + 1) % KYOKUSHIN_MOTTOS.length);
   };

   const handlePrev = () => {
      setCurrentIndex(prev => (prev - 1 + KYOKUSHIN_MOTTOS.length) % KYOKUSHIN_MOTTOS.length);
   };

   const currentMotto = KYOKUSHIN_MOTTOS[currentIndex];

   return (
      <Paper variant='outlined' elevation={0} square={false}>
                  <Box sx={{display: 'flex', justifyContent: 'flex-end', alignItems: 'center', backgroundColor: 'grey.300'}}>
            <IconButton onClick={onClose} aria-label='close'>
               <Close />
            </IconButton>
         </Box>

         <Card
            variant='outlined'
            sx={{
               width: '24em',
               height: '28em',
               display: 'flex',
               flexDirection: 'column',
               overflowY: 'auto',
            }}>
            <CardContent
               sx={{
                  flexGrow: 1,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  textAlign: 'center',
               }}>
               <Typography variant='h5' component='div' gutterBottom>
                  {currentMotto.shortTitle}
               </Typography>
               <Typography variant='body1' color='text.secondary'>
                  {currentMotto.text}
               </Typography>
            </CardContent>
            <CardActions sx={{justifyContent: 'space-between'}}>
               <IconButton size='small' onClick={handlePrev} aria-label='previous motto'>
                  <ArrowBackIos fontSize='small' />
               </IconButton>
               <Typography variant='body2' color='text.secondary'>
                  {currentIndex + 1} / {KYOKUSHIN_MOTTOS.length}
               </Typography>
               <IconButton size='small' onClick={handleNext} aria-label='next motto'>
                  <ArrowForwardIos fontSize='small' />
               </IconButton>
            </CardActions>
         </Card>
      </Paper>
   );
};

export default MottoDeck;
