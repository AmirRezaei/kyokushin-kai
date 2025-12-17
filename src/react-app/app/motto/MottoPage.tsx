// File: ./src/app/motto/mottoPage.tsx

import {Box, Chip, Container, Grid, Typography, useTheme} from '@mui/material';
import React, {useState} from 'react';

import {MottoCard} from './components/MottoCard';
import {MottoExplorer} from './components/MottoExplorer';
import {KYOKUSHIN_MOTTOS} from './constants';
import {analyzeMotto} from './services/mottoAnalysisService';
import {Motto, MottoAnalysis, ViewState} from './types';

function MottoPage() {
   const theme = useTheme();
   const [viewState, setViewState] = useState<ViewState>(ViewState.GRID);
   const [selectedMotto, setSelectedMotto] = useState<Motto | null>(null);

   const handleMottoClick = (motto: Motto) => {
      setSelectedMotto(motto);
      setViewState(ViewState.DETAIL);
      window.scrollTo({top: 0, behavior: 'smooth'});
   };

   const handleBack = () => {
      setViewState(ViewState.GRID);
      setTimeout(() => setSelectedMotto(null), 300);
   };

   return (
      <Box
         sx={{
            minHeight: '100vh',
            backgroundColor: theme.palette.background.default,
            display: 'flex',
            flexDirection: 'column',
         }}>
         {/* Main Content */}
         <Container
            maxWidth='lg'
            sx={{
               flexGrow: 1,
               py: {xs: 2, md: 4},
               px: {xs: 2, sm: 3, lg: 4},
            }}>
            {viewState === ViewState.GRID ? (
               <Box>
                  {/* Hero Section */}
                  <Box textAlign='center' mb={6} maxWidth='800px' mx='auto'>
                     <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                        {/* <Typography variant='overline' component='span' color='red' sx={{fontWeight: 'bold', textTransform: 'uppercase'}}>
                           Kyokushin Spirit
                        </Typography> */}
                        <Typography variant='h4' component='span'>
                           座右の銘十一個条
                        </Typography>

                        <Typography variant='h4' component='span' fontWeight='bold' sx={{fontSize: {xs: '2rem', md: '3rem'}}}>
                           Eleven Mottos of{' '}
                           <Box component='span' sx={{color: theme.palette.primary.main}}>
                              Kyokushin
                           </Box>
                        </Typography>
                        <Typography
                           variant='h6'
                           color='text.secondary'
                           sx={{
                              fontFamily: 'serif',
                              lineHeight: 1.6,
                              maxWidth: '600px',
                              mx: 'auto',
                           }}>
                           Explore the philosophical foundation of the Ultimate Truth.
                        </Typography>
                        <Chip
                           label="Sosai Mas Oyama's Legacy"
                           sx={{
                              backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[300],
                              color: theme.palette.mode === 'dark' ? theme.palette.grey[300] : theme.palette.grey[700],
                              fontWeight: 'bold',
                              textTransform: 'uppercase',
                              letterSpacing: 1,
                           }}
                        />
                     </Box>
                  </Box>

                  {/* Motto Grid */}
                  <Grid container spacing={3} mb={8}>
                     {KYOKUSHIN_MOTTOS.map(motto => (
                        <Grid item xs={12} md={6} lg={4} key={motto.id}>
                           <MottoCard motto={motto} onClick={handleMottoClick} />
                        </Grid>
                     ))}
                  </Grid>

                  {/* Quote */}
                  <Box textAlign='center'>
                     <Typography
                        variant='body2'
                        color='text.secondary'
                        sx={{
                           fontStyle: 'italic',
                           fontFamily: 'serif',
                        }}>
                        "One becomes a beginner after 1,000 days of training and an expert after 10,000 days of practice."
                     </Typography>
                  </Box>
               </Box>
            ) : (
               selectedMotto && <MottoExplorer motto={selectedMotto} onBack={handleBack} />
            )}
         </Container>
      </Box>
   );
}

export default MottoPage;
