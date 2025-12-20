// File: ./src/app/WordQuest/FlashCard/FlashCardPlayer.tsx

import { ArrowBack, ArrowForward, Flip, Shuffle, SwapHoriz } from '@mui/icons-material';
import {
  Box,
  Container,
  Fab,
  FormControl,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Stack,
  Tooltip,
  Typography,
  Zoom,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { useDecks } from './Deck/DeckContext';
import { useFlashCards } from './FlashCardContext';
import { FlashCard } from './types';
import CategorySelect from './UI/CategorySelect';

const FlashCardPlayer: React.FC = () => {
  const theme = useTheme();
  const { decks } = useDecks();
  const { flashCards } = useFlashCards();
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [flipped, setFlipped] = useState<boolean>(false);
  const [selectedDeckId, setSelectedDeckId] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [shuffledCards, setShuffledCards] = useState<FlashCard[] | null>(null);
  const [isReversed, setIsReversed] = useState<boolean>(false);

  /**
   * Filter flashCards based on selected deck and category.
   */
  const filteredFlashCards = useMemo(() => {
    let filtered = flashCards;
    if (selectedDeckId !== 'All') {
      filtered = filtered.filter((card) => card.deckId === selectedDeckId);
    }
    if (selectedCategory !== 'All') {
      filtered = filtered.filter((card) => card.category === selectedCategory);
    }
    return filtered;
  }, [flashCards, selectedDeckId, selectedCategory]);

  const orderedFlashCards = shuffledCards ?? filteredFlashCards;

  // Track previous filtered cards to reset state on change
  const [prevFilteredCards, setPrevFilteredCards] = useState(filteredFlashCards);

  if (filteredFlashCards !== prevFilteredCards) {
    setPrevFilteredCards(filteredFlashCards);
    setShuffledCards(null);
    setCurrentIndex(0);
    setFlipped(false);
  }

  // Safety check: If currentIndex is out of bounds, reset it.
  if (currentIndex >= orderedFlashCards.length && orderedFlashCards.length > 0) {
    setCurrentIndex(0);
  }

  /**
   * Shuffle the ordered flashcards.
   */
  const shuffleFlashCards = () => {
    const shuffled = [...orderedFlashCards].sort(() => Math.random() - 0.5);
    setShuffledCards(shuffled);
    setCurrentIndex(0);
    setFlipped(false);
  };

  /**
   * Handle flipping the current flashcard.
   */
  const handleFlip = useCallback(() => {
    setFlipped((prev) => !prev);
  }, []);

  const handleReverse = () => {
    setIsReversed((prev) => !prev);
    setFlipped(false);
  };

  /**
   * Navigate to the next flashcard.
   */
  const handleNext = useCallback(() => {
    setFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % orderedFlashCards.length);
  }, [orderedFlashCards.length]);

  /**
   * Navigate to the previous flashcard.
   */
  const handlePrev = useCallback(() => {
    setFlipped(false);
    setCurrentIndex((prev) => (prev === 0 ? orderedFlashCards.length - 1 : prev - 1));
  }, [orderedFlashCards.length]);

  /**
   * Keyboard shortcuts
   */
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleFlip();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleFlip, handleNext, handlePrev]);

  /**
   * Handle deck selection change for filtering.
   */
  const handleDeckChange = (event: SelectChangeEvent<string>) => {
    setSelectedDeckId(event.target.value as string);
  };

  /**
   * Handle category selection change for filtering.
   */
  const handleCategoryChange = (event: SelectChangeEvent<string>) => {
    setSelectedCategory(event.target.value as string);
  };

  // Get deck options
  const deckOptions: { id: string; name: string }[] = decks.map((deck) => ({
    id: deck.id,
    name: deck.name,
  }));

  if (orderedFlashCards.length === 0) {
    return (
      <Paper
        elevation={2}
        sx={{
          p: theme.spacing(6),
          textAlign: 'center',
          borderRadius: theme.spacing(3),
          background:
            theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Typography
          variant="h5"
          gutterBottom
          sx={{ fontWeight: 600, color: theme.palette.text.primary }}
        >
          No Flashcards Available
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: theme.spacing(4) }}>
          Please add some flashcards and assign them to decks and categories in the Manager.
        </Typography>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ justifyContent: 'center', alignItems: 'center' }}
        >
          <FormControl variant="outlined" sx={{ minWidth: 200 }}>
            <InputLabel>Deck</InputLabel>
            <Select value={selectedDeckId} onChange={handleDeckChange} label="Deck">
              <MenuItem value="All">All</MenuItem>
              {deckOptions.map((deck) => (
                <MenuItem key={deck.id} value={deck.id}>
                  {deck.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <CategorySelect
            handleCategoryChange={handleCategoryChange}
            selectedCategory={selectedCategory}
          />
        </Stack>
      </Paper>
    );
  }

  const safeIndex = currentIndex >= 0 && currentIndex < orderedFlashCards.length ? currentIndex : 0;
  const currentCard = orderedFlashCards[safeIndex];

  if (!currentCard) {
    return null; // Should be handled by empty check above, but safe guard.
  }

  const progress = ((safeIndex + 1) / orderedFlashCards.length) * 100;

  return (
    <Container maxWidth="md" sx={{ py: { xs: 2, md: 4 } }}>
      <Box
        sx={{
          perspective: '1500px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: { xs: '300px', sm: '400px', md: '500px' },
          mb: 3,
        }}
      >
        <Zoom in timeout={300}>
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              maxWidth: { xs: '100%', sm: '450px', md: '500px' },
              height: { xs: '300px', sm: '400px', md: '500px' },
            }}
          >
            <Box
              onClick={handleFlip}
              sx={{
                width: '100%',
                height: '100%',
                cursor: 'pointer',
                transformStyle: 'preserve-3d',
                transition: 'transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1)',
                transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                transformOrigin: 'center',
                '&:hover': {
                  transform: flipped ? 'rotateY(180deg) scale(1.02)' : 'rotateY(0deg) scale(1.02)',
                },
              }}
            >
              {/* Front Face */}
              <Paper
                elevation={8}
                sx={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  backfaceVisibility: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: { xs: theme.spacing(2), sm: theme.spacing(3) },
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                  p: { xs: theme.spacing(2), sm: theme.spacing(3), md: theme.spacing(4) },
                  boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                }}
              >
                <Box sx={{ textAlign: 'center' }}>
                  <Typography
                    sx={{
                      fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                      color: theme.palette.primary.contrastText,
                      fontWeight: 700,
                      textShadow: '0 2px 8px rgba(0,0,0,0.2)',
                      wordBreak: 'break-word',
                    }}
                  >
                    {isReversed ? currentCard.answer : currentCard.question}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: theme.palette.primary.contrastText,
                      opacity: 0.7,
                      mt: theme.spacing(2),
                      display: 'block',
                    }}
                  >
                    Click or press SPACE to flip
                  </Typography>
                </Box>
              </Paper>

              {/* Back Face */}
              <Paper
                elevation={8}
                sx={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  backfaceVisibility: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: theme.spacing(3),
                  background: `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.dark})`,
                  p: theme.spacing(4),
                  transform: 'rotateY(180deg)',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                }}
              >
                <Box sx={{ textAlign: 'center' }}>
                  <Typography
                    sx={{
                      fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                      color: theme.palette.secondary.contrastText,
                      fontWeight: 700,
                      textShadow: '0 2px 8px rgba(0,0,0,0.2)',
                      wordBreak: 'break-word',
                    }}
                  >
                    {isReversed ? currentCard.question : currentCard.answer}
                  </Typography>
                </Box>
              </Paper>
            </Box>
          </Box>
        </Zoom>
      </Box>

      {/* Navigation Controls */}
      <Stack direction="row" spacing={{ xs: 1, sm: 2 }} sx={{ mb: 4, justifyContent: 'center' }}>
        <Tooltip title="Previous (←)" arrow>
          <Fab
            color="primary"
            onClick={handlePrev}
            sx={{
              width: { xs: 48, sm: 56 },
              height: { xs: 48, sm: 56 },
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'scale(1.1)',
              },
            }}
          >
            <ArrowBack sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />
          </Fab>
        </Tooltip>

        <Tooltip title="Flip Card (SPACE)" arrow>
          <Fab
            color="secondary"
            onClick={handleFlip}
            sx={{
              width: { xs: 48, sm: 56 },
              height: { xs: 48, sm: 56 },
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'scale(1.1) rotate(180deg)',
              },
            }}
          >
            <Flip sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />
          </Fab>
        </Tooltip>

        <Tooltip title="Next (→)" arrow>
          <Fab
            color="primary"
            onClick={handleNext}
            sx={{
              width: { xs: 48, sm: 56 },
              height: { xs: 48, sm: 56 },
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'scale(1.1)',
              },
            }}
          >
            <ArrowForward sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />
          </Fab>
        </Tooltip>
      </Stack>

      {/* Progress Section */}
      <Box sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, px: 1 }}>
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            Progress
          </Typography>
          <Typography variant="body2" color="text.secondary" fontWeight={600}>
            {currentIndex + 1} / {orderedFlashCards.length}
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 10,
            borderRadius: 5,
            backgroundColor:
              theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
            '& .MuiLinearProgress-bar': {
              borderRadius: 5,
            },
          }}
        />
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', mt: 1, textAlign: 'center' }}
        >
          {orderedFlashCards.length - currentIndex - 1} cards remaining
        </Typography>
      </Box>

      {/* Filter and Action Controls */}
      <Paper
        elevation={2}
        sx={{
          p: { xs: theme.spacing(1.5), sm: theme.spacing(2) },
          borderRadius: theme.spacing(2),
          background:
            theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(10px)',
          mb: 2,
        }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={{ xs: 1.5, sm: 2 }}
          sx={{ alignItems: 'center', justifyContent: 'space-between' }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 1, sm: 2 }}
            sx={{ flex: 1, width: { xs: '100%', sm: 'auto' } }}
          >
            <FormControl variant="outlined" size="small" sx={{ minWidth: { xs: '100%', sm: 150 } }}>
              <InputLabel>Deck</InputLabel>
              <Select value={selectedDeckId} onChange={handleDeckChange} label="Deck">
                <MenuItem value="All">All Decks</MenuItem>
                {deckOptions.map((deck) => (
                  <MenuItem key={deck.id} value={deck.id}>
                    {deck.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box sx={{ width: { xs: '100%', sm: 'auto' } }}>
              <CategorySelect
                handleCategoryChange={handleCategoryChange}
                selectedCategory={selectedCategory}
              />
            </Box>
          </Stack>

          <Stack direction="row" spacing={1}>
            <Tooltip title="Shuffle Cards" arrow>
              <Fab
                size="small"
                color="primary"
                onClick={shuffleFlashCards}
                sx={{
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'rotate(180deg) scale(1.1)',
                  },
                }}
              >
                <Shuffle />
              </Fab>
            </Tooltip>

            <Tooltip title="Swap Question/Answer" arrow>
              <Fab
                size="small"
                color={isReversed ? 'secondary' : 'default'}
                onClick={handleReverse}
                sx={{
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.1)',
                  },
                }}
              >
                <SwapHoriz />
              </Fab>
            </Tooltip>
          </Stack>
        </Stack>
      </Paper>

      {/* Keyboard Shortcuts Help */}
      <Box
        sx={{
          mt: theme.spacing(1),
          textAlign: 'center',
          display: { xs: 'none', sm: 'block' },
        }}
      >
        <Typography variant="caption" color="text.secondary">
          Keyboard shortcuts: SPACE/ENTER to flip • ← → to navigate
        </Typography>
      </Box>
    </Container>
  );
};

export default FlashCardPlayer;
