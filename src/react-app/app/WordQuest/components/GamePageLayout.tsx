// File: src/react-app/app/WordQuest/components/GamePageLayout.tsx

import { Box, useTheme } from '@mui/material';
import React from 'react';
import GamePageHeader from './GamePageHeader';

interface GamePageLayoutProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
  showHeader?: boolean;
}

/**
 * Reusable layout component for all Word Quest game pages.
 * Provides consistent header, background, and content structure.
 */
const GamePageLayout: React.FC<GamePageLayoutProps> = ({
  icon,
  title,
  description,
  children,
  showHeader = true,
}) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${theme.palette.primary.dark}22 0%, ${theme.palette.secondary.dark}22 100%)`,
      }}
    >
      {/* Header Section */}
      {showHeader && <GamePageHeader icon={icon} title={title} description={description} />}

      {/* Content Section - Always visible */}
      <Box sx={{ mt: showHeader ? 0 : 2 }}>{children}</Box>
    </Box>
  );
};

export default GamePageLayout;
