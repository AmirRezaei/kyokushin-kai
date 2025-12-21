// File: ./src/app/WordQuest/FlashCard/FlashCardMatchGame.tsx

import { ArrowBack, Refresh } from '@mui/icons-material';
import {
  Box,
  Button,
  Container,
  Grid,
  Paper,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useTheme,
  Zoom,
} from '@mui/material';
import React, { useEffect, useState } from 'react';

import { KyokushinRepository } from '../../../../data/repo/KyokushinRepository';
import { getBeltColorHex } from '../../../../data/repo/gradeHelpers';
import {
  getLocalizedTextKey,
  Language,
  LanguageEnum,
  useLanguage,
} from '../../../components/context/LanguageContext';
import { useDecks } from './Deck/DeckContext';
import DeckSelector from './Deck/DeckSelector';
import { useFlashCards } from './FlashCardContext';

// Game Card Interface
interface GameCard {
  id: string; // Unique ID for the game card instance
  techniqueId: string; // ID to match against
  content: string; // Text to display
  type: 'romaji' | 'target'; // Type of card
  isFlipped: boolean;
  isMatched: boolean;
  showCount: number; // Penalty tracking
}

type Difficulty = 'easy' | 'medium' | 'hard';

const FlashCardMatchGame: React.FC = () => {
  const theme = useTheme();
  const { decks } = useDecks();
  const { flashCards } = useFlashCards();
  const { selectedLanguages } = useLanguage();

  // Game State
  const [gameState, setGameState] = useState<'selecting' | 'playing' | 'finished'>('selecting');
  const [selectedDeckId, setSelectedDeckId] = useState<string>('');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [cards, setCards] = useState<GameCard[]>([]);
  const [score, setScore] = useState<number>(0);
  const [flippedCards, setFlippedCards] = useState<GameCard[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false); // Lock interaction during animations
  const [deckColor, setDeckColor] = useState<string | null>(null);

  // Determine Target Language (First non-Romaji, or fallback to English)
  const targetLanguage: Language =
    selectedLanguages.find((l: Language) => l !== LanguageEnum.Romaji) || LanguageEnum.English;

  // Configuration based on difficulty
  const getDifficultySettings = (diff: Difficulty) => {
    switch (diff) {
      case 'easy':
        return { penaltyThreshold: 5, penaltyPoints: 10 };
      case 'medium':
        return { penaltyThreshold: 3, penaltyPoints: 20 };
      case 'hard':
        return { penaltyThreshold: 2, penaltyPoints: 30 };
    }
  };

  const { penaltyThreshold, penaltyPoints } = getDifficultySettings(difficulty);

  // Generate Cards
  const startGame = async () => {
    if (!selectedDeckId) return;

    let gameItems: { id: string; romaji: string; target: string }[] = [];
    let currentDeckColor: string | null = null;

    if (selectedDeckId.startsWith('deck-')) {
      // System Deck - Using Repository
      // deck-rankID -> extract rankID
      const grades = KyokushinRepository.getCurriculumGrades();
      const gradeId = selectedDeckId.replace('deck-', '');
      const grade = grades.find((g) => g.id === gradeId);

      if (grade) {
        // Set Color
        currentDeckColor = getBeltColorHex(grade.beltColor);

        // Techniques
        grade.techniques.forEach((tech) => {
          const targetKey = getLocalizedTextKey(targetLanguage);
          // @ts-expect-error - dynamic access to localized names based on key
          const targetText = tech.name[targetKey] || tech.name.en || tech.name.romaji;
          gameItems.push({
            id: tech.id,
            romaji: tech.name.romaji || 'Unknown',
            target: targetText || 'Unknown',
          });
        });

        // Katas
        grade.katas.forEach((kata) => {
          const targetKey = getLocalizedTextKey(targetLanguage);
          // @ts-expect-error - dynamic access to localized names based on key
          const targetText = kata.name[targetKey] || kata.name.en || kata.name.romaji;
          gameItems.push({
            id: kata.id,
            romaji: kata.name.romaji || 'Unknown',
            target: targetText || 'Unknown',
          });
        });
        // You could add Katas here too if structure supports
      }
    } else {
      // Custom Deck - Using FlashCardContext
      const deck = decks.find((d) => d.id === selectedDeckId);
      if (deck) {
        const deckCards = flashCards.filter((c) => deck.flashCardIds.includes(c.id));
        deckCards.forEach((c) => {
          gameItems.push({
            id: c.id,
            romaji: c.question, // Assuming question is usually 'source'
            target: c.answer, // and answer is 'target'
          });
        });
      }
    }

    // Capture the color state
    setDeckColor(currentDeckColor);

    // Limit card count for gameplay (e.g., max 8 pairs = 16 cards) to keep it manageable
    // For now, let's take up to 12 pairs
    gameItems = gameItems.sort(() => Math.random() - 0.5).slice(0, 12);

    // Create Pair Cards
    const newCards: GameCard[] = [];
    gameItems.forEach((item) => {
      // Card 1: Romaji
      newCards.push({
        id: `${item.id}-romaji`,
        techniqueId: item.id,
        content: item.romaji,
        type: 'romaji',
        isFlipped: false,
        isMatched: false,
        showCount: 0,
      });
      // Card 2: Target
      newCards.push({
        id: `${item.id}-target`,
        techniqueId: item.id,
        content: item.target,
        type: 'target',
        isFlipped: false,
        isMatched: false,
        showCount: 0,
      });
    });

    // Shuffle
    setCards(newCards.sort(() => Math.random() - 0.5));
    setScore(0);
    setFlippedCards([]);
    setGameState('playing');
  };

  const quitGame = () => {
    setGameState('selecting');
    setCards([]);
    setDeckColor(null);
  };

  // Handle Card Click
  const handleCardClick = (card: GameCard) => {
    // If waiting for reset (2 mismatched cards open), any click resets them
    if (flippedCards.length === 2 && !isProcessing) {
      // 1. Determine if the click was on one of the open cards

      // Reset the flipped cards
      setCards((prev) =>
        prev.map((c) =>
          flippedCards.some((fc) => fc.id === c.id) ? { ...c, isFlipped: false } : c,
        ),
      );
      setFlippedCards([]);

      // If the user clicked a NEW card (not one of the mismatched ones), we should probably process that click too?
      // Standard UX: Click anywhere matches "Reset". User must click again to flip new card.
      // We will perform JUST the reset.
      return;
    }

    // Normal interactions
    if (isProcessing || card.isFlipped || card.isMatched || gameState !== 'playing') {
      return;
    }

    // Flip the card
    const updatedCards = cards.map((c) => (c.id === card.id ? { ...c, isFlipped: true } : c));
    setCards(updatedCards);

    const newFlipped = [...flippedCards, card];
    setFlippedCards(newFlipped);

    // Check Match
    if (newFlipped.length === 2) {
      setIsProcessing(true);
      checkMatch(updatedCards, newFlipped[0], newFlipped[1]);
    }
  };

  const checkMatch = (currentCards: GameCard[], card1: GameCard, card2: GameCard) => {
    const isMatch = card1.techniqueId === card2.techniqueId;

    if (isMatch) {
      // Success
      setTimeout(() => {
        setCards((prev) =>
          prev.map((c) =>
            c.id === card1.id || c.id === card2.id ? { ...c, isMatched: true, isFlipped: true } : c,
          ),
        );
        setScore((prev) => prev + 100);
        setFlippedCards([]);
        setIsProcessing(false);
      }, 600);
    } else {
      // Failure - Don't auto-flip back. Wait for user input.
      setIsProcessing(false);

      // Apply penalty logic immediately (but don't show it as 'flipped: false' yet)

      // Logic: If THIS card has been shown too much?
      // We need to update showCount in state for NEXT time.
      // But we can't update 'cards' here without conflicting with the reset logic later if we aren't careful.
      // Let's update showCount NOW.

      setCards((prev) =>
        prev.map((c) => {
          if (c.id === card1.id || c.id === card2.id) {
            const newShowCount = c.showCount + 1;
            // Apply penalty if threshold exceeded
            if (newShowCount > penaltyThreshold) {
              // Only apply penalty if it hasn't been applied for this specific accumulation?
              // Simple: Apply.
              // We need to be careful not to apply it twice if React renders twice. But state updates are batched.
            }
            return { ...c, showCount: newShowCount };
          }
          return c;
        }),
      );

      // Calculate penalty separately to avoid map side-effects
      const penalty =
        card1.showCount >= penaltyThreshold || card2.showCount >= penaltyThreshold
          ? penaltyPoints
          : 0;
      if (penalty > 0) {
        setScore((s) => Math.max(0, s - penalty));
      }
    }
  };

  // Check Win Condition
  useEffect(() => {
    if (gameState === 'playing' && cards.length > 0) {
      const allMatched = cards.every((c) => c.isMatched);
      if (allMatched) {
        setTimeout(() => setGameState('finished'), 500);
      }
    }
  }, [cards, gameState]);

  if (gameState === 'selecting') {
    return (
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            p: 4,
            mt: 4,
            borderRadius: 2,
            textAlign: 'center',
            background:
              theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
            Match Game
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Match the Romaji techniques with their meanings!
          </Typography>

          <Stack spacing={3}>
            <DeckSelector
              selectedDeckId={selectedDeckId}
              onDeckChange={setSelectedDeckId}
              showCounts
              filterEmpty
            />

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Difficulty
              </Typography>
              <ToggleButtonGroup
                value={difficulty}
                exclusive
                onChange={(_, val) => val && setDifficulty(val)}
                fullWidth
                color="primary"
              >
                <ToggleButton value="easy">Easy</ToggleButton>
                <ToggleButton value="medium">Medium</ToggleButton>
                <ToggleButton value="hard">Hard</ToggleButton>
              </ToggleButtonGroup>
            </Box>

            <Button
              variant="contained"
              size="large"
              onClick={startGame}
              disabled={!selectedDeckId}
              sx={{ py: 1.5, fontSize: '1.2rem' }}
            >
              Start Game
            </Button>
          </Stack>
        </Paper>
      </Container>
    );
  }

  if (gameState === 'finished') {
    return (
      <Container maxWidth="sm" sx={{ textAlign: 'center', mt: 1 }}>
        <Zoom in>
          <Paper
            elevation={4}
            sx={{
              // p: 6,
              borderRadius: 4,
              background: `linear-gradient(135deg, ${theme.palette.success.dark}, ${theme.palette.success.main})`,
            }}
          >
            <Typography variant="h2" sx={{ mb: 2, fontSize: '4rem' }}>
              🎉
            </Typography>
            <Typography variant="h3" color="white" fontWeight="bold" gutterBottom>
              Great Job!
            </Typography>
            <Typography variant="h5" color="white" sx={{ mb: 4, opacity: 0.9 }}>
              Final Score: {score}
            </Typography>
            <Button
              variant="contained"
              color="inherit"
              size="large"
              onClick={quitGame}
              startIcon={<Refresh />}
              sx={{ color: theme.palette.success.main, fontWeight: 'bold' }}
            >
              Play Again
            </Button>
          </Paper>
        </Zoom>
      </Container>
    );
  }

  // Determine card back style based on deckColor or default
  const getCardBackStyle = () => {
    if (deckColor) {
      // Check if light color for contrast
      const isLight = ['#FFFFFF', '#FFD700', '#FFA500'].includes(deckColor.toUpperCase());
      const textColor = isLight ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)';

      return {
        // Add depth with a gradient overlay on top of the base color
        // Top-left is lighter (shine), Bottom-right is darker (shadow)
        background: `linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.3) 100%), ${deckColor}`,
        textColor,
      };
    }

    // Default
    return {
      background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.dark} 90%)`,
      textColor: 'rgba(255,255,255,0.2)',
    };
  };

  const cardStyle = getCardBackStyle();

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      {/* HUD */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{
          mb: 3,
          p: 2,
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 1,
        }}
      >
        <Button startIcon={<ArrowBack />} onClick={quitGame}>
          Quit
        </Button>
        <Typography variant="h5" fontWeight="bold" color="primary">
          Score: {score}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {difficulty.toUpperCase()}
        </Typography>
      </Stack>

      {/* Grid */}
      <Grid container spacing={2}>
        {cards.map((card) => (
          <Grid item xs={3} sm={3} md={2} key={card.id}>
            <Box
              onClick={() => handleCardClick(card)}
              sx={{
                width: '100%',
                aspectRatio: '3/4',
                perspective: '1000px',
                cursor: 'pointer',
              }}
            >
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  transition: 'transform 0.6s',
                  transformStyle: 'preserve-3d',
                  transform: card.isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  boxShadow: card.isMatched ? 'none' : 3,
                  opacity: card.isMatched ? 0 : 1,
                  // If matched, we can hide it or just keep it faded
                  visibility: card.isMatched ? 'hidden' : 'visible',
                }}
              >
                {/* Front (Hidden state - styled back of card) */}
                <Box
                  sx={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    backfaceVisibility: 'hidden',
                    bgcolor: 'primary.main',
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: cardStyle.background,
                  }}
                >
                  <Typography variant="h4" color={cardStyle.textColor}>
                    ?
                  </Typography>
                </Box>

                {/* Back (Revealed state - Content) */}
                <Box
                  sx={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 1,
                    textAlign: 'center',
                    border: `2px solid ${card.type === 'romaji' ? theme.palette.info.light : theme.palette.warning.light}`,
                  }}
                >
                  <Typography
                    variant="body1"
                    fontWeight="bold"
                    sx={{
                      fontSize: { xs: '0.8rem', sm: '1rem' },
                      wordBreak: 'break-word',
                    }}
                  >
                    {card.content}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default FlashCardMatchGame;
