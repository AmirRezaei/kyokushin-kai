// File: ./src/app/WordQuest/Card/CardManagerPage.tsx

import React from 'react';
import { Style } from '@mui/icons-material';

import { DeckProvider } from './Deck/DeckContext';
import { CardProvider } from './CardContext';
import { useFullscreen } from '../../../components/context/FullscreenContext';
import GamePageLayout from '../components/GamePageLayout';
import CardManager from './Manager/CardManager';

const CardManagerPage: React.FC = () => {
  const { isFullscreen } = useFullscreen();

  return (
    <GamePageLayout
      icon={<Style />}
      title="Card Manager"
      description="Create and manage your learning cards"
      showHeader={!isFullscreen}
    >
      <DeckProvider>
        <CardProvider>
          <CardManager />
        </CardProvider>
      </DeckProvider>
    </GamePageLayout>
  );
};

export default CardManagerPage;
