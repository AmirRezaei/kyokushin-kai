// File: ./src/app/WordQuest/FlashCard/FlashCardPage.tsx

import { School } from '@mui/icons-material';
import { Box, Container, Fade, Paper, Tab, Tabs, Typography, useTheme } from '@mui/material';
import React, { useState } from 'react';

import { DeckProvider } from './Deck/DeckContext';
import DeckManager from './Deck/DeckManager';
import { FlashCardProvider } from './FlashCardContext';
import FlashCardPlayer from './FlashCardPlayer';
import FlashCardManager from './Manager/FlashCardManager';

const FlashCardPage: React.FC = () => {
  const theme = useTheme();
  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${theme.palette.primary.dark}22 0%, ${theme.palette.secondary.dark}22 100%)`,
        py: theme.spacing(4),
      }}
    >
      <Container maxWidth="xl">
        {/* Header Section */}
        <Fade in timeout={800}>
          <Paper
            elevation={2}
            sx={{
              mb: theme.spacing(2),
              textAlign: 'center',
              borderRadius: theme.spacing(1),
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
                Flashcard Master
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
              Master your karate techniques with interactive flashcards
            </Typography>
          </Paper>
        </Fade>

        <DeckProvider>
          <FlashCardProvider>
            {/* Navigation Tabs */}
            <Fade in timeout={1000}>
              <Paper
                elevation={3}
                sx={{
                  mb: theme.spacing(3),
                  borderRadius: theme.spacing(1),
                  overflow: 'hidden',
                  background:
                    theme.palette.mode === 'dark'
                      ? 'rgba(255,255,255,0.05)'
                      : 'rgba(255,255,255,0.9)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <Tabs
                  value={value}
                  onChange={handleChange}
                  variant="fullWidth"
                  indicatorColor="primary"
                  textColor="primary"
                  sx={{
                    '& .MuiTab-root': {
                      py: theme.spacing(2),
                      fontSize: '1rem',
                      fontWeight: 600,
                      textTransform: 'none',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: theme.palette.action.hover,
                        transform: 'translateY(-2px)',
                      },
                      '&.Mui-selected': {
                        color: theme.palette.primary.main,
                        fontWeight: 700,
                      },
                    },
                    '& .MuiTabs-indicator': {
                      height: 4,
                      borderRadius: '4px 4px 0 0',
                    },
                  }}
                >
                  <Tab label="🎮 Play" />
                  <Tab label="📝 Manage Flashcards" />
                  <Tab label="📚 Manage Decks" />
                </Tabs>
              </Paper>
            </Fade>

            {/* Tab Content */}
            <Fade in key={value} timeout={600}>
              <Box>
                {value === 0 && <FlashCardPlayer />}
                {value === 1 && <FlashCardManager />}
                {value === 2 && <DeckManager />}
              </Box>
            </Fade>
          </FlashCardProvider>
        </DeckProvider>
      </Container>
    </Box>
  );
};

export default FlashCardPage;
