// File: ./src/app/motto/mottoPage.tsx

import { Box, Chip, Container, Grid, Typography, useTheme } from '@mui/material';
import React, { useEffect, useState } from 'react';

import { MottoCard } from './components/MottoCard';
import { MottoExplorer } from './components/MottoExplorer';
import { Motto, ViewState, MOTTO_TITLES_ORDER } from './types';

function MottoPage() {
  const theme = useTheme();
  const [viewState, setViewState] = useState<ViewState>(ViewState.GRID);
  const [selectedMotto, setSelectedMotto] = useState<Motto | null>(null);
  const [mottos, setMottos] = useState<Motto[]>([]);

  useEffect(() => {
    const fetchMottos = async () => {
      try {
        const res = await fetch('/api/v1/mottos');
        if (res.ok) {
          const data = await res.json();
          if (data.mottos) {
            const loadedMottos: Motto[] = data.mottos;
            loadedMottos.sort((a, b) => {
              // Prioritize custom sort order
              if (
                a.sortOrder !== undefined &&
                b.sortOrder !== undefined &&
                a.sortOrder !== b.sortOrder
              ) {
                return a.sortOrder - b.sortOrder;
              }
              const idxA = MOTTO_TITLES_ORDER.indexOf(a.shortTitle);
              const idxB = MOTTO_TITLES_ORDER.indexOf(b.shortTitle);
              return idxA - idxB;
            });
            setMottos(loadedMottos);
          }
        }
      } catch (error) {
        console.error('Failed to load mottos', error);
      }
    };
    fetchMottos();
  }, []);

  const handleMottoClick = (motto: Motto) => {
    setSelectedMotto(motto);
    setViewState(ViewState.DETAIL);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      }}
    >
      {/* Main Content */}
      <Container
        maxWidth="lg"
        sx={{
          flexGrow: 1,
          py: { xs: 2, md: 4 },
          px: { xs: 2, sm: 3, lg: 4 },
        }}
      >
        {viewState === ViewState.GRID ? (
          <Box>
            {/* Hero Section */}
            <Box textAlign="center" mb={6} maxWidth="800px" mx="auto">
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {/* <Typography variant='overline' component='span' color='red' sx={{fontWeight: 'bold', textTransform: 'uppercase'}}>
                           Kyokushin Spirit
                        </Typography> */}
                <Typography variant="h4" component="span">
                  座右の銘十一個条
                </Typography>

                <Typography
                  variant="h4"
                  component="span"
                  fontWeight="bold"
                  sx={{ fontSize: { xs: '2rem', md: '3rem' } }}
                >
                  Eleven Mottos of{' '}
                  <Box component="span" sx={{ color: theme.palette.primary.main }}>
                    Kyokushin
                  </Box>
                </Typography>
                <Typography
                  variant="h6"
                  color="text.secondary"
                  sx={{
                    fontFamily: 'serif',
                    lineHeight: 1.6,
                    maxWidth: '600px',
                    mx: 'auto',
                  }}
                >
                  Explore the philosophical foundation of the Ultimate Truth.
                </Typography>
                <Chip
                  label="Sosai Mas Oyama's Legacy"
                  sx={{
                    backgroundColor:
                      theme.palette.mode === 'dark'
                        ? theme.palette.grey[800]
                        : theme.palette.grey[300],
                    color:
                      theme.palette.mode === 'dark'
                        ? theme.palette.grey[300]
                        : theme.palette.grey[700],
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                  }}
                />
              </Box>
            </Box>

            {/* Motto Grid */}
            <Grid container spacing={3} mb={8}>
              {mottos.map((motto, index) => (
                <Grid item xs={12} md={6} lg={4} key={motto.id}>
                  <MottoCard motto={motto} index={index} onClick={handleMottoClick} />
                </Grid>
              ))}
            </Grid>

            {/* Quote */}
            <Box textAlign="center">
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  fontStyle: 'italic',
                  fontFamily: 'serif',
                }}
              >
                "One becomes a beginner after 1,000 days of training and an expert after 10,000 days
                of practice."
              </Typography>
            </Box>
          </Box>
        ) : (
          selectedMotto && (
            <MottoExplorer
              motto={selectedMotto}
              index={mottos.indexOf(selectedMotto)}
              onBack={handleBack}
            />
          )
        )}
      </Container>
    </Box>
  );
}

export default MottoPage;
