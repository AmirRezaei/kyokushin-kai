// File: ./src/app/motto/components/MottoExplorer.tsx

import {ArrowBack, AutoAwesome, Landscape, MenuBook, People, SelfImprovement, SportsMartialArts} from '@mui/icons-material';
import {Box, Button, Card, CardContent, Chip, CircularProgress, Container, Divider, Grid, Paper, Typography, useTheme} from '@mui/material';
import React, {useEffect, useState} from 'react';

import {analyzeMotto} from '../services/mottoAnalysisService';
import {Motto, MottoAnalysis} from '../types';

interface MottoExplorerProps {
   motto: Motto;
   onBack: () => void;
}

export const MottoExplorer: React.FC<MottoExplorerProps> = ({motto, onBack}) => {
   const [analysis, setAnalysis] = useState<MottoAnalysis | null>(null);
   const [loading, setLoading] = useState<boolean>(true);
   const [activeTab, setActiveTab] = useState<keyof MottoAnalysis>('philosophy');
   const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');

   // Removed image-related state variables

   useEffect(() => {
      let mounted = true;

      const fetchAnalysis = async () => {
         setLoading(true);
         try {
            const result = analyzeMotto[motto.id];
            if (mounted) setAnalysis(result);
         } catch (err) {
            // Error handled silently
         } finally {
            if (mounted) setLoading(false);
         }
      };

      fetchAnalysis();

      return () => {
         mounted = false;
      };
   }, [motto]);

   // Breathing animation logic for Meditation tab
   useEffect(() => {
      if (activeTab !== 'meditation') return;

      const inhaleDuration = 4000;
      const holdDuration = 2000;
      const exhaleDuration = 4000;

      const cycle = () => {
         setBreathPhase('inhale');
         setTimeout(() => {
            setBreathPhase('hold');
            setTimeout(() => {
               setBreathPhase('exhale');
            }, holdDuration);
         }, inhaleDuration);
      };

      cycle();
      const interval = setInterval(cycle, inhaleDuration + holdDuration + exhaleDuration);

      return () => clearInterval(interval);
   }, [activeTab]);

   const tabs = [
      {id: 'philosophy', label: 'Philosophy', icon: MenuBook},
      {id: 'origin', label: 'Origin', icon: Landscape},
      {id: 'dojoApplication', label: 'Dojo', icon: SportsMartialArts},
      {id: 'lifeApplication', label: 'Real Life', icon: People},
      {id: 'meditation', label: 'Meditate', icon: SelfImprovement},
   ] as const;

   const theme = useTheme();

   return (
      <Container maxWidth='lg' sx={{py: 2}}>
         {/* Back Button */}
         <Button
            onClick={onBack}
            startIcon={<ArrowBack />}
            sx={{
               'mb': 3,
               'color': theme.palette.text.secondary,
               '&:hover': {
                  color: theme.palette.primary.main,
               },
            }}>
            Back to Dojo
         </Button>

         <Paper elevation={3} sx={{borderRadius: 4, overflow: 'hidden', mb: 4}}>
            <Box
               sx={{
                  'position': 'relative',
                  'p': {xs: 4, md: 6},
                  'background': theme.palette.mode === 'dark' ? `linear-gradient(135deg, ${theme.palette.grey[900]} 0%, ${theme.palette.grey[800]} 100%)` : `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.primary.dark}15 100%)`,
                  'color': theme.palette.mode === 'dark' ? 'white' : theme.palette.text.primary,
                  'minHeight': 400,
                  'display': 'flex',
                  'flexDirection': 'column',
                  'justifyContent': 'center',
                  'alignItems': 'center',
                  '&::before': {
                     content: '""',
                     position: 'absolute',
                     top: -128,
                     right: -128,
                     width: 384,
                     height: 384,
                     background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                     borderRadius: '50%',
                     opacity: theme.palette.mode === 'dark' ? 0.2 : 0.1,
                     filter: 'blur(96px)',
                  },
               }}>
               <Box sx={{position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 800}}>
                  <Chip
                     label={`Motto ${motto.id}`}
                     sx={{
                        mb: 3,
                        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                        color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
                        border: theme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(0, 0, 0, 0.2)',
                        backdropFilter: 'blur(8px)',
                     }}
                  />
                  <Typography
                     variant='h3'
                     component='h2'
                     fontWeight='bold'
                     sx={{
                        mb: 3,
                        fontSize: {xs: '2rem', md: '3rem'},
                        textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                     }}>
                     {motto.shortTitle}
                  </Typography>
                  <Typography
                     variant='h5'
                     sx={{
                        fontStyle: 'italic',
                        fontFamily: 'serif',
                        color: theme.palette.mode === 'dark' ? theme.palette.grey[300] : theme.palette.grey[700],
                        textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                        lineHeight: 1.4,
                     }}>
                     "{motto.text}"
                  </Typography>
               </Box>
            </Box>

            {/* Content Section */}
            <Box sx={{p: {xs: 2, md: 4}}}>
               {loading ? (
                  <Box display='flex' flexDirection='column' alignItems='center' justifyContent='center' py={12} gap={3}>
                     <CircularProgress size={64} sx={{color: theme.palette.primary.main}} />
                     <Typography
                        variant='h6'
                        color='text.secondary'
                        sx={{
                           fontStyle: 'italic',
                           fontFamily: 'serif',
                        }}>
                        Consulting the wisdom of the masters...
                     </Typography>
                  </Box>
               ) : analysis ? (
                  <Grid container spacing={4} sx={{minHeight: 500}}>
                     {/* Tabs Navigation */}
                     <Grid item xs={12} lg={3}>
                        <Box sx={{display: 'flex', flexDirection: 'column', gap: 1}}>
                           {tabs.map(tab => {
                              const Icon = tab.icon;
                              const isActive = activeTab === tab.id;
                              return (
                                 <Button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as keyof MottoAnalysis)}
                                    variant={isActive ? 'contained' : 'outlined'}
                                    startIcon={<Icon />}
                                    sx={{
                                       justifyContent: 'flex-start',
                                       py: 2,
                                       px: 3,
                                       borderRadius: 3,
                                       textTransform: 'none',
                                       fontWeight: 500,
                                       letterSpacing: 0.5,
                                       ...(isActive && {
                                          boxShadow: theme.shadows[4],
                                          transform: 'scale(1.02)',
                                       }),
                                    }}>
                                    {tab.label}
                                 </Button>
                              );
                           })}
                        </Box>
                     </Grid>

                     {/* Detail Content */}
                     <Grid item xs={12} lg={9}>
                        {activeTab === 'meditation' ? (
                           <Card
                              sx={{
                                 backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.background.paper,
                                 color: theme.palette.mode === 'dark' ? 'white' : theme.palette.text.primary,
                                 height: '100%',
                                 display: 'flex',
                                 flexDirection: 'column',
                                 alignItems: 'center',
                                 justifyContent: 'center',
                                 textAlign: 'center',
                                 position: 'relative',
                                 overflow: 'hidden',
                                 borderRadius: 4,
                              }}>
                              {/* Breathing Animation Background */}
                              <Box
                                 sx={{
                                    position: 'absolute',
                                    width: 256,
                                    height: 256,
                                    borderRadius: '50%',
                                    backgroundColor: theme.palette.primary.main,
                                    opacity: breathPhase === 'inhale' || breathPhase === 'hold' ? 0.4 : 0.2,
                                    filter: 'blur(96px)',
                                    transition: 'all 4000ms ease-in-out',
                                    transform: `scale(${breathPhase === 'inhale' || breathPhase === 'hold' ? 1.5 : 0.75})`,
                                 }}
                              />

                              {/* Breathing Circle Indicator */}
                              <Box sx={{position: 'relative', zIndex: 1, mb: 6}}>
                                 <Box
                                    sx={{
                                       width: 192,
                                       height: 192,
                                       borderRadius: '50%',
                                       border: `4px solid ${theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.text.primary}`,
                                       borderColor:
                                          breathPhase === 'inhale' ? theme.palette.primary.main : breathPhase === 'hold' ? (theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.text.primary) : theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : theme.palette.grey[300],
                                       display: 'flex',
                                       alignItems: 'center',
                                       justifyContent: 'center',
                                       transition: 'all 4000ms ease-in-out',
                                       transform: `scale(${breathPhase === 'inhale' || breathPhase === 'hold' ? 1.1 : 0.9})`,
                                       boxShadow: breathPhase === 'inhale' ? `0 0 50px ${theme.palette.primary.main}80` : 'none',
                                    }}>
                                    <Typography
                                       variant='h5'
                                       sx={{
                                          fontFamily: 'serif',
                                          fontWeight: 'bold',
                                          letterSpacing: 2,
                                          textTransform: 'uppercase',
                                          color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.9)' : theme.palette.text.primary,
                                       }}>
                                       {breathPhase === 'inhale' ? 'Inhale' : breathPhase === 'hold' ? 'Hold' : 'Exhale'}
                                    </Typography>
                                 </Box>
                              </Box>

                              <Box sx={{position: 'relative', zIndex: 1, maxWidth: 600}}>
                                 <Typography
                                    variant='subtitle1'
                                    sx={{
                                       color: theme.palette.mode === 'dark' ? theme.palette.grey[400] : theme.palette.text.secondary,
                                       textTransform: 'uppercase',
                                       letterSpacing: 1.5,
                                       mb: 2,
                                    }}>
                                    Mokuso (Meditation)
                                 </Typography>
                                 <Typography
                                    variant='h4'
                                    sx={{
                                       fontFamily: 'serif',
                                       lineHeight: 1.4,
                                       fontStyle: 'italic',
                                       color: theme.palette.mode === 'dark' ? 'white' : theme.palette.text.primary,
                                    }}>
                                    "{analysis.meditation}"
                                 </Typography>
                              </Box>
                           </Card>
                        ) : (
                           <Card
                              sx={{
                                 backgroundColor: theme.palette.background.paper,
                                 height: '100%',
                                 borderRadius: 4,
                                 border: `1px solid ${theme.palette.divider}`,
                                 position: 'relative',
                              }}>
                              <CardContent sx={{p: {xs: 3, md: 4}}}>
                                 {/* Header */}
                                 <Box display='flex' alignItems='center' mb={3}>
                                    <Box
                                       sx={{
                                          p: 2,
                                          backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[50],
                                          borderRadius: 2,
                                          boxShadow: theme.shadows[1],
                                          border: `1px solid ${theme.palette.divider}`,
                                          mr: 2,
                                       }}>
                                       {(() => {
                                          const Icon = tabs.find(t => t.id === activeTab)?.icon || AutoAwesome;
                                          return <Icon sx={{fontSize: 24, color: theme.palette.primary.main}} />;
                                       })()}
                                    </Box>
                                    <Typography variant='h5' fontWeight='bold' sx={{letterSpacing: 0.5}}>
                                       {tabs.find(t => t.id === activeTab)?.label}
                                    </Typography>
                                 </Box>

                                 {/* Content */}
                                 <Box sx={{mb: 3}}>
                                    {analysis[activeTab].split('\n').map((paragraph, idx) => (
                                       <Typography
                                          key={idx}
                                          variant='body1'
                                          sx={{
                                             'mb': 2,
                                             'lineHeight': 1.7,
                                             'fontFamily': 'serif',
                                             'color': theme.palette.text.primary,
                                             '&:last-child': {mb: 0},
                                          }}>
                                          {paragraph}
                                       </Typography>
                                    ))}
                                 </Box>

                                 {activeTab === 'dojoApplication' && (
                                    <>
                                       <Divider sx={{my: 3}} />
                                       <Box display='flex' justifyContent='flex-end'>
                                          <Typography
                                             variant='body2'
                                             sx={{
                                                color: theme.palette.primary.main,
                                                fontWeight: 'bold',
                                                textTransform: 'uppercase',
                                                letterSpacing: 1,
                                                opacity: 0.7,
                                             }}>
                                             Osu!
                                          </Typography>
                                       </Box>
                                    </>
                                 )}
                              </CardContent>
                           </Card>
                        )}
                     </Grid>
                  </Grid>
               ) : (
                  <Box textAlign='center' py={10}>
                     <Typography variant='h6' color='error'>
                        Failed to load wisdom. Please try again.
                     </Typography>
                  </Box>
               )}
            </Box>
         </Paper>
      </Container>
   );
};
