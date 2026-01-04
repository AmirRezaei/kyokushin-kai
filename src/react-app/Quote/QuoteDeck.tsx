// HEADER-START
// * Path: ./src/Quote/QuoteComponent.tsx
// HEADER-END
import {
  ArrowBackIos,
  ArrowForwardIos,
  ContentCopy,
  Favorite,
  FavoriteBorder,
  Pause,
  PlayArrow,
} from '@mui/icons-material';
import {
  Avatar,
  Box,
  BoxProps,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import {
  AnimatePresence,
  motion,
  useAnimation,
  useMotionValue,
  useSpring,
  useTransform,
} from 'framer-motion';
import React, { useEffect, useRef, useState } from 'react';

import { useAuth } from '../components/context/AuthContext';
import {
  getLocalStorageItemById,
  setLocalStorageItemById,
} from '../components/utils/localStorageUtils';

// --- Type Definitions ---
type QuoteRecord = {
  id: string;
  author: string;
  tags: string[];
  date?: string;
  text: string;
  meaning: string;
  history?: string;
  reference?: string;
  isFavorited?: boolean;
};

// Define the component props
interface QuoteProps extends BoxProps {
  quotes?: QuoteRecord[];
}

// --- Constants ---
const FAVORITE_QUOTES_KEY = 'favoriteQuotes';
const PAUSE_BEFORE_SCROLL_MS = 3000;
const PAUSE_AFTER_SCROLL_MS = 5000;
const SCROLL_SPEED_PX_PER_SEC = 20;
const MIN_SCROLL_DURATION_SEC = 5;
const SCROLL_BOTTOM_PADDING = 20;

const normalizeQuote = (quote: QuoteRecord): QuoteRecord => ({
  ...quote,
  author: typeof quote.author === 'string' ? quote.author : 'Unknown',
  text: typeof quote.text === 'string' ? quote.text : '',
  meaning: typeof quote.meaning === 'string' ? quote.meaning : '',
  tags: Array.isArray(quote.tags) ? quote.tags : [],
  isFavorited: Boolean(quote.isFavorited),
});

// --- Inner Component for Isolated Scrolling Logic ---
interface QuoteCardInnerProps {
  quote: QuoteRecord;
  isPlaying: boolean;
  onComplete: () => void;
}

const QuoteCardInner: React.FC<QuoteCardInnerProps> = ({ quote, isPlaying, onComplete }) => {
  const theme = useTheme();
  const scrollControls = useAnimation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const avatarUrl = quote.author ? `/media/avatar/${quote.author.replace(/ /g, '-')}.jpg` : '';

  // Auto-play and Scroll Logic
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let nextTimeoutId: NodeJS.Timeout;

    const startScrollSequence = async () => {
      // 1. Reset Position
      await scrollControls.start({ y: 0, transition: { duration: 0 } });

      if (!isPlaying) return;

      // 2. Initial Delay
      timeoutId = setTimeout(async () => {
        if (!isPlaying || !scrollRef.current || !containerRef.current) return;

        const scrollHeight = scrollRef.current.scrollHeight;
        const containerHeight = containerRef.current.offsetHeight;
        const maxScroll = Math.max(0, scrollHeight - containerHeight);

        if (maxScroll > 0) {
          const duration = Math.max(MIN_SCROLL_DURATION_SEC, maxScroll / SCROLL_SPEED_PX_PER_SEC);

          // 3. Animate Scroll
          await scrollControls.start({
            y: -maxScroll,
            transition: { duration: duration, ease: 'linear' },
          });
        }

        // 4. Pause at bottom then trigger Next
        nextTimeoutId = setTimeout(() => {
          if (isPlaying) {
            onComplete();
          }
        }, PAUSE_AFTER_SCROLL_MS);
      }, PAUSE_BEFORE_SCROLL_MS);
    };

    startScrollSequence();

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(nextTimeoutId);
      scrollControls.stop();
    };
  }, [isPlaying, onComplete, scrollControls, quote]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        flex: 1,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0, // Ensure it can shrink to fit parent
      }}
    >
      {' '}
      <Box
        sx={{
          width: '100%',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0, // Critical for nested scrolling
        }}
      >
        {/* Header Section */}
        <Box
          sx={{
            pt: { xs: 1, sm: 2 },
            pb: { xs: 1, sm: 2 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            backgroundColor: alpha(theme.palette.common.black, 0.05),
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          {/* Author Avatar */}
          <Avatar
            variant="circular"
            src={avatarUrl}
            alt={quote.author}
            sx={{
              width: { xs: 80, sm: 100 },
              height: { xs: 80, sm: 100 },
              boxShadow: `0 1rem 2rem ${alpha(theme.palette.common.black, 0.2)}`,
            }}
          >
            {quote.author.charAt(0)}
          </Avatar>

          {/* Author Name (Header) */}
          <Typography
            component={motion.h2}
            variant="body1"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            sx={{
              fontWeight: 700,
              textAlign: 'center',
              color: theme.palette.text.primary,
              marginBottom: 2,
              px: 2,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              transform: 'translateZ(40px)',
            }}
          >
            {quote.author}
          </Typography>

          {/* Quote Text (Fixed) */}
          <Typography
            variant="h6"
            color="text.primary"
            component={motion.p}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            sx={{
              textAlign: 'center',
              fontStyle: 'italic',
              fontWeight: 500,
              fontSize: { xs: '1.2rem', sm: '1.4rem' },
              lineHeight: 1.5,
              px: 3,
              transform: 'translateZ(30px)',
            }}
          >
            "{quote.text}"
          </Typography>
        </Box>

        {/* Scrollable Content */}
        <Box
          ref={containerRef}
          sx={{
            flex: 1,
            width: '100%',
            overflowY: 'auto',
            overscrollBehavior: 'contain',
            touchAction: 'pan-y', // Ensure vertical scroll is handled by this element
            position: 'relative',
            px: { xs: 3, sm: 4 }, // Added padding here
            minHeight: 75,
            zIndex: 5,
            maskImage:
              'linear-gradient(to bottom, transparent 0%, black 5%, black 95%, transparent 100%)',
            WebkitMaskImage:
              'linear-gradient(to bottom, transparent 0%, black 5%, black 95%, transparent 100%)',
            '&::-webkit-scrollbar': { width: '4px' },
            '&::-webkit-scrollbar-track': { background: 'transparent' },
            '&::-webkit-scrollbar-thumb': {
              background: alpha(theme.palette.text.secondary, 0.3),
              borderRadius: '4px',
            },
          }}
        >
          <motion.div
            ref={scrollRef}
            animate={scrollControls}
            style={{
              paddingBottom: SCROLL_BOTTOM_PADDING,
              paddingTop: 10,
              textAlign: 'center',
            }}
          >
            {/* Meaning */}
            {quote.meaning && (
              <Box sx={{ mt: 1, mb: 0.5 }}>
                <Typography
                  variant="subtitle2"
                  color="error"
                  sx={{
                    mb: 0.5,
                    textTransform: 'uppercase',
                    fontSize: '0.75rem',
                    letterSpacing: 1,
                  }}
                >
                  Meaning
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  {quote.meaning}
                </Typography>
              </Box>
            )}

            {/* History */}
            {quote.history && (
              <Box sx={{ mb: 0.5 }}>
                <Typography
                  variant="subtitle2"
                  color="error"
                  sx={{
                    mb: 0.5,
                    textTransform: 'uppercase',
                    fontSize: '0.75rem',
                    letterSpacing: 1,
                  }}
                >
                  History
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  {quote.history}
                </Typography>
              </Box>
            )}

            {/* Reference */}
            {quote.reference && (
              <Box sx={{ mb: 0 }}>
                <Typography variant="caption" color="text.disabled" sx={{ fontStyle: 'italic' }}>
                  Ref: {quote.reference}
                </Typography>
              </Box>
            )}

            {/* Tags */}
            {quote.tags && quote.tags.length > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 0.5 }}>
                {quote.tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    size="small"
                    variant="outlined"
                    sx={{
                      borderColor: alpha(theme.palette.divider, 0.2),
                      color: theme.palette.text.secondary,
                      fontSize: '0.7rem',
                      height: 20,
                    }}
                  />
                ))}
              </Box>
            )}
          </motion.div>
        </Box>
      </Box>
    </motion.div>
  );
};

// --- Main QuoteDeck Component ---
const QuoteDeck: React.FC<QuoteProps> = ({ quotes: initialQuotes, sx }) => {
  const theme = useTheme();
  const { token } = useAuth();
  const [quotes, setQuotes] = useState<QuoteRecord[]>(
    Array.isArray(initialQuotes) ? initialQuotes.map(normalizeQuote) : [],
  );
  const [currentIndex, setCurrentIndex] = useState(() =>
    Array.isArray(initialQuotes) && initialQuotes.length > 0
      ? Math.floor(Math.random() * initialQuotes.length)
      : 0,
  );
  const [isPlaying, setIsPlaying] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [favoriteTrigger, setFavoriteTrigger] = useState(0);

  // Fetch logic if no props provided
  useEffect(() => {
    if (initialQuotes && initialQuotes.length > 0) {
      return;
    }

    const fetchQuotes = async () => {
      try {
        const res = await fetch('/api/v1/quotes', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          if (data.quotes) {
            const loaded = (data.quotes as QuoteRecord[]).map(normalizeQuote);
            setQuotes(loaded);
            if (loaded.length > 0) {
              setCurrentIndex(Math.floor(Math.random() * loaded.length));
            }
          }
        }
      } catch (error) {
        console.error('Failed to load quotes', error);
      }
    };

    fetchQuotes();
  }, [initialQuotes, token]);

  // Current Quote derivation (handling Favorites override)
  const currentQuote = React.useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _ = favoriteTrigger;
    const current = quotes[currentIndex];
    if (!current) return null;
    const favorite = getLocalStorageItemById<QuoteRecord>(FAVORITE_QUOTES_KEY, current.id);
    return favorite ? normalizeQuote(favorite) : current;
  }, [currentIndex, quotes, favoriteTrigger]);

  // Handlers
  const handleNext = React.useCallback(() => {
    if (quotes.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % quotes.length);
  }, [quotes.length]);

  const handlePrev = React.useCallback(() => {
    if (quotes.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + quotes.length) % quotes.length);
  }, [quotes.length]);

  const handleToggleFavorite = () => {
    if (!currentQuote) return;
    const newState = !currentQuote.isFavorited;
    const updated = { ...currentQuote, isFavorited: newState };

    // Update local storage
    setLocalStorageItemById(FAVORITE_QUOTES_KEY, updated);

    // Update local state to reflect immediately
    setFavoriteTrigger((prev) => prev + 1);
  };

  const handleShare = () => {
    if (!currentQuote) return;
    const text = `"${currentQuote.text}" - ${currentQuote.author}`;
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // 3D Tilt Logic
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseX = useSpring(x, { stiffness: 150, damping: 15 });
  const mouseY = useSpring(y, { stiffness: 150, damping: 15 });
  const rotateX = useTransform(mouseY, [-0.5, 0.5], [4, -4]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-4, 4]);
  const shineX = useTransform(mouseX, [-0.5, 0.5], ['0%', '100%']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const normalizedX = (e.clientX - rect.left) / rect.width - 0.5;
    const normalizedY = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(normalizedX);
    y.set(normalizedY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  if (!currentQuote) return null;

  return (
    <Box
      sx={{
        perspective: 1000,
        width: { xs: '90vw', sm: '500px', md: '600px' },
        maxWidth: '95vw',
        margin: '0 auto',
        mt: 8, // Added margin top for AppBar spacing
        ...sx,
      }}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
      >
        <Card
          elevation={24}
          sx={{
            background:
              theme.palette.mode === 'dark'
                ? `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.default, 0.9)} 100%)`
                : `linear-gradient(135deg, ${alpha('#ffffff', 0.98)} 0%, ${alpha('#f5f5f5', 0.95)} 100%)`,
            backdropFilter: 'blur(20px)',
            borderRadius: 4,
            overflow: 'visible', // Changed from hidden to visible
            position: 'relative',
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            transformStyle: 'preserve-3d',
            height: { xs: '600px', sm: '650px' }, // Fixed height to prevent resizing
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Shine Effect */}
          <motion.div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `linear-gradient(135deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.05) 40%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.05) 60%, rgba(255,255,255,0) 100%)`,
              backgroundSize: '200% 200%',
              backgroundPositionX: shineX,
              zIndex: 10,
              pointerEvents: 'none',
              mixBlendMode: 'overlay',
            }}
          />

          {/* Decorative Top Bar */}
          <Box
            sx={{
              height: 6,
              background: `linear-gradient(90deg, ${theme.palette.error.main} 0%, ${theme.palette.warning.main} 50%, ${theme.palette.error.main} 100%)`,
              backgroundSize: '200% 100%',
              animation: 'gradientShift 3s ease infinite',
              '@keyframes gradientShift': {
                '0%': { backgroundPosition: '0% 50%' },
                '50%': { backgroundPosition: '100% 50%' },
                '100%': { backgroundPosition: '0% 50%' },
              },
              zIndex: 2,
            }}
          />

          {/* Top Controls */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1.5, zIndex: 20 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title={currentQuote.isFavorited ? 'Unfavorite' : 'Favorite'}>
                <IconButton
                  onClick={handleToggleFavorite}
                  size="small"
                  sx={{
                    color: currentQuote.isFavorited
                      ? theme.palette.error.main
                      : theme.palette.text.secondary,
                    bgcolor: alpha(theme.palette.background.paper, 0.5),
                    backdropFilter: 'blur(4px)',
                    '&:hover': {
                      bgcolor: alpha(theme.palette.error.main, 0.1),
                      transform: 'scale(1.1)',
                    },
                    transition: 'all 0.2s',
                  }}
                >
                  {currentQuote.isFavorited ? (
                    <Favorite fontSize="small" />
                  ) : (
                    <FavoriteBorder fontSize="small" />
                  )}
                </IconButton>
              </Tooltip>

              <Tooltip title={isCopied ? 'Copied!' : 'Copy Quote'}>
                <IconButton
                  onClick={handleShare}
                  size="small"
                  sx={{
                    color: isCopied ? theme.palette.success.main : theme.palette.text.secondary,
                    bgcolor: alpha(theme.palette.background.paper, 0.5),
                    backdropFilter: 'blur(4px)',
                    '&:hover': {
                      bgcolor: alpha(theme.palette.success.main, 0.1),
                      transform: 'scale(1.1)',
                    },
                    transition: 'all 0.2s',
                  }}
                >
                  <ContentCopy fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Content Area */}
          <CardContent
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            sx={{
              flex: 1,
              position: 'relative',
              padding: 0,
              '&:last-child': { paddingBottom: 0 },
              overflow: 'visible',
              transformStyle: 'preserve-3d',
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0, // Critical for nested scrolling
            }}
          >
            <AnimatePresence mode="wait">
              <QuoteCardInner
                key={currentIndex}
                quote={currentQuote}
                isPlaying={isPlaying}
                onComplete={handleNext}
              />
            </AnimatePresence>
          </CardContent>

          {/* Footer Controls */}
          <Box
            sx={{
              padding: 2,
              gap: 2,
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: alpha(theme.palette.background.default, 0.5),
              backdropFilter: 'blur(10px)',
              borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              transform: 'translateZ(20px)',
              zIndex: 1,
            }}
          >
            {/* Progress */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: theme.palette.text.secondary,
                  minWidth: '40px',
                  textAlign: 'center',
                }}
              >
                {currentIndex + 1} / {quotes.length}
              </Typography>
              <Box
                sx={{
                  width: '100%',
                  height: 4,
                  backgroundColor: alpha(theme.palette.divider, 0.3),
                  borderRadius: 2,
                  overflow: 'hidden',
                }}
              >
                <motion.div
                  animate={{ width: `${((currentIndex + 1) / quotes.length) * 100}%` }}
                  transition={{ duration: 0.3 }}
                  style={{ height: '100%', backgroundColor: theme.palette.error.main }}
                />
              </Box>
            </Box>

            {/* Nav Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3 }}>
              <IconButton
                onClick={handlePrev}
                sx={{
                  width: 48,
                  height: 48,
                  bgcolor: alpha(theme.palette.error.main, 0.1),
                  border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                  '&:hover': {
                    bgcolor: theme.palette.error.main,
                    color: 'white',
                    borderColor: theme.palette.error.main,
                  },
                  transition: 'all 0.2s',
                }}
              >
                <ArrowBackIos fontSize="small" sx={{ ml: 1 }} />
              </IconButton>

              <Tooltip title={isPlaying ? 'Pause' : 'Auto-Play'}>
                <IconButton
                  onClick={() => setIsPlaying(!isPlaying)}
                  sx={{
                    width: 48,
                    height: 48,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: isPlaying ? theme.palette.primary.main : theme.palette.text.secondary,
                    border: `1px solid ${isPlaying ? alpha(theme.palette.primary.main, 0.5) : alpha(theme.palette.divider, 0.2)}`,
                    '&:hover': {
                      bgcolor: theme.palette.primary.main,
                      color: 'white',
                      transform: 'scale(1.1)',
                    },
                    transition: 'all 0.2s',
                  }}
                >
                  {isPlaying ? <Pause /> : <PlayArrow />}
                </IconButton>
              </Tooltip>

              <IconButton
                onClick={handleNext}
                sx={{
                  width: 48,
                  height: 48,
                  bgcolor: alpha(theme.palette.error.main, 0.1),
                  border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                  '&:hover': {
                    bgcolor: theme.palette.error.main,
                    color: 'white',
                    borderColor: theme.palette.error.main,
                  },
                  transition: 'all 0.2s',
                }}
              >
                <ArrowForwardIos fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        </Card>
      </motion.div>
    </Box>
  );
};

export default QuoteDeck;
