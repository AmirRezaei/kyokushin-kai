// File: ./src/Home.tsx
import Box from '@mui/material/Box';
import { useState, useEffect, useRef } from 'react';

import MottoDeck from './components/kyokushin/MottoDeck';
import QuoteDeck from './Quote/QuoteDeck';
import mainBackground from './media/400x600/main.png';

const Home: React.FC = () => {
  const [showMottos, setShowMottos] = useState(true);
  const [scrollY, setScrollY] = useState(0);
  const hasScrolledToCenter = useRef(false);

  useEffect(() => {
    // Scroll to center on mount to allow scrolling up and down
    if (!hasScrolledToCenter.current) {
      const scrollToCenter = () => {
        const centerPosition = window.innerHeight * 1.5; // Middle of 300vh
        window.scrollTo({ top: centerPosition, behavior: 'instant' });
        hasScrolledToCenter.current = true;
      };

      // Small delay to ensure DOM is ready
      setTimeout(scrollToCenter, 0);
    }

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Parallax effect: background moves at 30% of scroll speed (reduced for subtlety)
  // Offset by initial center position to start centered
  const centerOffset = window.innerHeight * 1.5;
  const parallaxOffset = (scrollY - centerOffset) * 0.3;

  return (
    <>
      {/* Parallax Background Layer */}
      <Box
        sx={{
          position: 'fixed',
          top: '-100vh', // Larger offset to allow more upward parallax movement
          left: 0,
          width: '100%',
          height: '300vh', // Much larger to cover parallax movement in both directions
          backgroundImage: `url(${mainBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          transform: `translateY(${parallaxOffset}px)`,
          zIndex: 0,
          willChange: 'transform',
        }}
      />

      {/* Spacer to enable scrolling - 300vh total (150vh up, 150vh down from center) */}
      <Box sx={{ height: '300vh', position: 'relative', zIndex: 1 }} />

      {/* Fixed Content Layer */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 2,
          pointerEvents: 'none', // Allow scrolling through
          '& > *': {
            pointerEvents: 'auto', // Re-enable pointer events for children
          },
        }}
      >
        {showMottos ? <MottoDeck onClose={() => setShowMottos(false)} /> : <QuoteDeck />}
      </Box>
    </>
  );
};

export default Home;
