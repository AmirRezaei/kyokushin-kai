// File: ./src/app/WordQuest/Card/CardPage.tsx

import { School } from '@mui/icons-material';
import { Box, Container, Fade, Paper, Typography, useTheme } from '@mui/material';
import React from 'react';

import { DeckProvider } from './Deck/DeckContext';
import { CardProvider } from './CardContext';
import CardPlayer from './CardPlayer';

const CardPage: React.FC = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${theme.palette.primary.dark}22 0%, ${theme.palette.secondary.dark}22 100%)`,
      }}
    >
      <Container maxWidth="xl">
        {/* Header Section */}
        <Fade in timeout={800}>
          <Paper
            elevation={2}
            sx={{
              pt: theme.spacing(2),
              textAlign: 'center',
              bordderTopLeftRadius: theme.spacing(1),
              bordderTopRightRadius: theme.spacing(1),
              borderBottomLeftRadius: theme.spacing(0),
              borderBottomRightRadius: theme.spacing(0),
              background: theme.palette.primary.main,
            }}
          >
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: theme.spacing(1.5),
                mb: theme.spacing(0.5),
              }}
            >
              <School
                sx={{
                  fontSize: { xs: '2rem', sm: '2.5rem' },
                  color: theme.palette.primary.contrastText,
                }}
              />
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: '1.5rem', sm: '2rem' },
                  color: theme.palette.primary.contrastText,
                }}
              >
                Card Master
              </Typography>
            </Box>
            <Typography
              variant="body2"
              sx={{
                color: theme.palette.primary.contrastText,
                opacity: 0.9,
                display: { xs: 'none', sm: 'block' },
              }}
            >
              Master your karate techniques with interactive cards
            </Typography>
          </Paper>
        </Fade>

        <DeckProvider>
          <CardProvider>
            {/* Practice Content */}
            <Fade in timeout={1000}>
              <Box>
                <CardPlayer />
              </Box>
            </Fade>
          </CardProvider>
        </DeckProvider>
      </Container>
    </Box>
  );
};

export default CardPage;
