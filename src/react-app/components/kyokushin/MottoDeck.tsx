// File: ./src/components/kyokushin/MottoDeck.tsx
import {
  ArrowBackIos,
  ArrowForwardIos,
  Close,
  ContentCopy,
  Pause,
  PlayArrow,
} from '@mui/icons-material';
import {
  Box,
  Card,
  CardContent,
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
import React, { useEffect, useState, useRef } from 'react';

import { useAuth } from '../context/AuthContext';
import { Motto } from '../../app/motto/types';

// --- Constants for Scroll Timing ---
const PAUSE_BEFORE_SCROLL_MS = 10000;
const PAUSE_AFTER_SCROLL_MS = 5000;
const SCROLL_SPEED_PX_PER_SEC = 10; // Pixels per second
const MIN_SCROLL_DURATION_SEC = 5;
const SCROLL_BOTTOM_PADDING = 10; // Space to clear the bottom fade mask

// --- Inner Component for Isolated Scrolling Logic ---
interface MottoCardInnerProps {
  motto: Motto;
  isPlaying: boolean;
  onComplete: () => void;
}

const MottoCardInner: React.FC<MottoCardInnerProps> = ({ motto, isPlaying, onComplete }) => {
  const theme = useTheme();
  const scrollControls = useAnimation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-play and Scroll Logic
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let nextTimeoutId: NodeJS.Timeout;

    const startScrollSequence = async () => {
      // 1. Reset Position immediately
      await scrollControls.start({ y: 0, transition: { duration: 0 } });

      if (!isPlaying) return;

      // 2. Initial Delay before scrolling (Read the title)
      timeoutId = setTimeout(async () => {
        // Double check state after delay
        if (!isPlaying || !scrollRef.current || !containerRef.current) return;

        const scrollHeight = scrollRef.current.scrollHeight;
        const containerHeight = containerRef.current.offsetHeight;

        // Calculate how much we need to scroll to show the bottom
        // We scroll exactly to the end (scrollHeight - containerHeight)
        // The SCROLL_BOTTOM_PADDING ensures the text clears the mask fade
        const maxScroll = Math.max(0, scrollHeight - containerHeight);

        if (maxScroll > 0) {
          // Calculate duration based on distance to ensure readable speed
          // e.g., 20 pixels per second, but at least 5 seconds
          const duration = Math.max(MIN_SCROLL_DURATION_SEC, maxScroll / SCROLL_SPEED_PX_PER_SEC);

          // 3. Animate Scroll
          await scrollControls.start({
            y: -maxScroll,
            transition: { duration: duration, ease: 'linear' },
          });
        }

        // 4. Pause at bottom (or if no scroll needed) then trigger Next
        nextTimeoutId = setTimeout(() => {
          if (isPlaying) {
            onComplete();
          }
        }, PAUSE_AFTER_SCROLL_MS); // 3s pause after reading/scrolling
      }, PAUSE_BEFORE_SCROLL_MS); // 2s delay to read title
    };

    startScrollSequence();

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(nextTimeoutId);
      scrollControls.stop();
    };
  }, [isPlaying, onComplete, scrollControls, motto]); // Dependencies: re-run if these change

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)', z: -50 }}
      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)', z: 0 }}
      exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)', z: 50 }}
      transition={{ duration: 0.5, type: 'spring', bounce: 0.3 }}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
      }}
    >
      {/* Inner wrapper for padding to respect theme spacing */}
      <Box
        sx={{
          p: { xs: 4, sm: 5 },
          pt: { xs: 2 }, // Reduced top padding
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'center',
        }}
      >
        {/* Title */}
        <Typography
          component={motion.h2}
          variant="h3"
          initial={{ textShadow: '0px 0px 0px rgba(0,0,0,0)' }}
          animate={{
            textShadow:
              theme.palette.mode === 'dark'
                ? '0px 0px 20px rgba(239, 83, 80, 0.6)'
                : '0px 0px 20px rgba(211, 47, 47, 0.4)',
          }}
          transition={{ duration: 0.5, delay: 0.2 }}
          gutterBottom
          sx={{
            fontWeight: 700,
            background:
              theme.palette.mode === 'dark'
                ? `linear-gradient(135deg, ${theme.palette.error.light} 0%, ${theme.palette.warning.main} 100%)`
                : `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.error.dark} 100%)`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: 3,
            fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
            letterSpacing: '0.02em',
            textTransform: 'uppercase',
            transform: 'translateZ(40px)', // Pop out in 3D
          }}
        >
          {motto.shortTitle}
        </Typography>

        {/* Divider */}
        <Box
          component={motion.div}
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 80, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          sx={{
            height: 3,
            background: `linear-gradient(90deg, transparent, ${theme.palette.error.main}, transparent)`,
            marginBottom: 3,
            borderRadius: 2,
            transform: 'translateZ(20px)',
            flexShrink: 0,
          }}
        />

        {/* Scrollable Text Container */}
        <Box
          ref={containerRef}
          sx={{
            flex: 1,
            width: '100%',
            overflowY: isPlaying ? 'hidden' : 'auto',
            position: 'relative',
            maskImage:
              'linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)',
            WebkitMaskImage:
              'linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)',
            // Custom Scrollbar
            '&::-webkit-scrollbar': {
              width: '4px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              background: alpha(theme.palette.text.secondary, 0.3),
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: alpha(theme.palette.text.secondary, 0.5),
            },
          }}
        >
          <motion.div
            ref={scrollRef}
            animate={scrollControls}
            style={{
              paddingBottom: SCROLL_BOTTOM_PADDING,
              paddingTop: 10,
            }}
          >
            {/* Original Motto Text */}
            <Typography
              variant="h6"
              color="text.primary"
              component={motion.p}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              sx={{
                transform: 'translateZ(30px)',
                textShadow: theme.palette.mode === 'dark' ? '0 2px 4px rgba(0,0,0,0.5)' : 'none',
                mb: 3,
                fontWeight: 500,
              }}
            >
              {motto.text}
            </Typography>

            {/* Additional Details Text */}
            {motto.details && (
              <Typography
                variant="body1"
                color="text.secondary"
                component={motion.p}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                sx={{
                  transform: 'translateZ(20px)',
                  fontStyle: 'italic',
                  lineHeight: 1.6,
                }}
              >
                {motto.details}
              </Typography>
            )}
          </motion.div>
        </Box>
      </Box>
    </motion.div>
  );
};

interface MottoDeckProps {
  onClose: () => void;
}

const MottoDeck: React.FC<MottoDeckProps> = ({ onClose }) => {
  const { token } = useAuth();
  const [mottos, setMottos] = useState<Motto[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    const fetchMottos = async () => {
      try {
        const headers: HeadersInit = {};
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }
        const res = await fetch('/api/v1/mottos', { headers });
        if (res.ok) {
          const data = await res.json();
          if (data.mottos) {
            const loadedMottos: Motto[] = data.mottos;
            loadedMottos.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
            setMottos(loadedMottos);
          }
        }
      } catch (error) {
        console.error('Failed to load mottos', error);
      }
    };
    fetchMottos();
  }, [token]);

  // 3D Tilt Mapped Values
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth springs for tilt
  const mouseX = useSpring(x, { stiffness: 150, damping: 15 });
  const mouseY = useSpring(y, { stiffness: 150, damping: 15 });

  const rotateX = useTransform(mouseY, [-0.5, 0.5], [4, -4]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-4, 4]);
  const shineX = useTransform(mouseX, [-0.5, 0.5], ['0%', '100%']);

  const handleNext = React.useCallback(() => {
    if (mottos.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % mottos.length);
  }, [mottos.length]);

  const handlePrev = React.useCallback(() => {
    if (mottos.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + mottos.length) % mottos.length);
  }, [mottos.length]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Calculate normalized mouse position (-0.5 to 0.5)
    const normalizedX = (e.clientX - rect.left) / width - 0.5;
    const normalizedY = (e.clientY - rect.top) / height - 0.5;

    x.set(normalizedX);
    y.set(normalizedY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const currentMotto = mottos[currentIndex];

  if (!currentMotto) return null;

  const handleShare = () => {
    const text = `"${currentMotto.text}" - Kyokushin Motto: ${currentMotto.shortTitle}`;
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <Box
      sx={{
        perspective: 1000, // Essential for 3D effect
        width: { xs: '90vw', sm: '500px', md: '600px' },
        maxWidth: '95vw',
        py: 4, // Add some vertical space for the tilt to not clip
      }}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Main Card */}
        <Card
          elevation={24}
          sx={{
            background:
              theme.palette.mode === 'dark'
                ? `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.default, 0.9)} 100%)`
                : `linear-gradient(135deg, ${alpha('#ffffff', 0.98)} 0%, ${alpha('#f5f5f5', 0.95)} 100%)`,
            backdropFilter: 'blur(20px)',
            borderRadius: 4,
            overflow: 'hidden',
            position: 'relative',
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            transformStyle: 'preserve-3d', // Ensure children can float in 3D
          }}
        >
          {/* Dynamic Glare/Shine Effect */}
          <motion.div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `linear-gradient(
                135deg,
                rgba(255,255,255,0) 0%,
                rgba(255,255,255,0.05) 40%,
                rgba(255,255,255,0.2) 50%,
                rgba(255,255,255,0.05) 60%,
                rgba(255,255,255,0) 100%
              )`,
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
              background: `linear-gradient(90deg,
                     ${theme.palette.error.main} 0%,
                     ${theme.palette.warning.main} 50%,
                     ${theme.palette.error.main} 100%)`,
              backgroundSize: '200% 100%',
              animation: 'gradientShift 3s ease infinite',
              '@keyframes gradientShift': {
                '0%': { backgroundPosition: '0% 50%' },
                '50%': { backgroundPosition: '100% 50%' },
                '100%': { backgroundPosition: '0% 50%' },
              },
              position: 'relative',
              zIndex: 2,
            }}
          />

          {/* Top Controls Section - Copy & Close */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              p: 1,
              pt: 2,
              px: 2,
              position: 'relative',
              zIndex: 20, // ensure clickable above background
            }}
          >
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title={isCopied ? 'Copied!' : 'Copy Motto'}>
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

              <Tooltip title="Close">
                <IconButton
                  onClick={onClose}
                  size="small"
                  sx={{
                    color: theme.palette.text.secondary,
                    bgcolor: alpha(theme.palette.background.paper, 0.5),
                    backdropFilter: 'blur(4px)',
                    '&:hover': {
                      bgcolor: alpha(theme.palette.error.main, 0.1),
                      color: theme.palette.error.main,
                      transform: 'rotate(90deg) scale(1.1)',
                    },
                    transition: 'all 0.3s',
                  }}
                >
                  <Close fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Flame Background */}
          <Box
            component={motion.div}
            animate={{
              opacity: theme.palette.mode === 'dark' ? [0.15, 0.25, 0.15] : [0.05, 0.1, 0.05],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: 'url(/media/backgrounds/flame_bg.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              mixBlendMode: theme.palette.mode === 'dark' ? 'screen' : 'multiply',
              filter: 'blur(3px)',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />

          {/* Content Area */}
          <CardContent
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            sx={{
              minHeight: { xs: '400px', sm: '450px' },
              position: 'relative',
              padding: 0,
              '&:last-child': { paddingBottom: 0 },
              overflow: 'hidden',
              transformStyle: 'preserve-3d',
            }}
          >
            <AnimatePresence mode="popLayout">
              {/* Render the Isolated Inner Card Component */}
              <MottoCardInner
                key={currentIndex}
                motto={currentMotto}
                isPlaying={isPlaying}
                onComplete={handleNext}
              />
            </AnimatePresence>
          </CardContent>

          {/* Navigation Footer */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              padding: 2,
              gap: 2,
              backgroundColor: alpha(theme.palette.background.default, 0.5),
              backdropFilter: 'blur(10px)',
              borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              position: 'relative',
              zIndex: 1,
              transform: 'translateZ(20px)', // Separate layer
            }}
          >
            {/* Progress Indicator */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: theme.palette.text.secondary,
                  fontSize: '0.9rem',
                  minWidth: '40px',
                  textAlign: 'center',
                }}
              >
                {currentIndex + 1} / {mottos.length}
              </Typography>
              <Box
                sx={{
                  width: 150,
                  height: 4,
                  backgroundColor: alpha(theme.palette.divider, 0.3),
                  borderRadius: 2,
                  overflow: 'hidden',
                }}
              >
                <motion.div
                  initial={false}
                  animate={{ width: `${((currentIndex + 1) / mottos.length) * 100}%` }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  style={{
                    height: '100%',
                    backgroundColor: theme.palette.error.main,
                  }}
                />
              </Box>
            </Box>

            {/* Controls Logic: Prev - Play - Next */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 3,
                width: '100%',
              }}
            >
              <IconButton
                onClick={handlePrev}
                aria-label="previous motto"
                sx={{
                  backgroundColor: alpha(theme.palette.error.main, 0.1),
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: theme.palette.error.main,
                    color: theme.palette.error.contrastText,
                    transform: 'translateX(-4px) scale(1.1)',
                  },
                }}
              >
                <ArrowBackIos fontSize="small" sx={{ ml: 0.5 }} />
              </IconButton>

              <Tooltip title={isPlaying ? 'Pause Slideshow' : 'Auto-Play'} placement="top">
                <IconButton
                  onClick={() => setIsPlaying(!isPlaying)}
                  sx={{
                    width: 48,
                    height: 48,
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    color: isPlaying ? theme.palette.primary.main : theme.palette.text.secondary,
                    border: `1px solid ${
                      isPlaying
                        ? alpha(theme.palette.primary.main, 0.5)
                        : alpha(theme.palette.divider, 0.2)
                    }`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: theme.palette.primary.main,
                      color: theme.palette.primary.contrastText,
                      transform: 'scale(1.1)',
                    },
                  }}
                >
                  {isPlaying ? <Pause /> : <PlayArrow />}
                </IconButton>
              </Tooltip>

              <IconButton
                onClick={handleNext}
                aria-label="next motto"
                sx={{
                  backgroundColor: alpha(theme.palette.error.main, 0.1),
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: theme.palette.error.main,
                    color: theme.palette.error.contrastText,
                    transform: 'translateX(4px) scale(1.1)',
                  },
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

export default MottoDeck;
