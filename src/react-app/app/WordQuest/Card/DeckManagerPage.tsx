// File: ./src/app/WordQuest/Card/DeckManagerPage.tsx

import { Box, Container, Fade, Paper, Typography, useTheme } from '@mui/material';
import React from 'react';
import { LibraryBooks } from '@mui/icons-material';

import { DeckProvider } from './Deck/DeckContext';
import { CardProvider } from './CardContext';
import DeckManager from './Deck/DeckManager';

const DeckManagerPage: React.FC = () => {
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
              pb: theme.spacing(2),
              textAlign: 'center',
              borderRadius: theme.spacing(1),
              background: theme.palette.primary.main,
              mb: theme.spacing(2),
            }}
          >
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: theme.spacing(1.5),
              }}
            >
              <LibraryBooks
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
                Deck Manager
              </Typography>
            </Box>
            <Typography
              variant="body2"
              sx={{
                color: theme.palette.primary.contrastText,
                opacity: 0.9,
                mt: 1,
              }}
            >
              Organize your cards into custom decks
            </Typography>
          </Paper>
        </Fade>

        <DeckProvider>
          <CardProvider>
            <Fade in timeout={1000}>
              <Box>
                <DeckManager />
              </Box>
            </Fade>
          </CardProvider>
        </DeckProvider>
      </Container>
    </Box>
  );
};

export default DeckManagerPage;
