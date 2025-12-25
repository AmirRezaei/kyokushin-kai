// File: ./src/app/WordQuest/Card/CardMatchPage.tsx

import React from 'react';
import { Extension } from '@mui/icons-material';

import { DeckProvider } from './Deck/DeckContext';
import { CardProvider } from './CardContext';
import { useFullscreen } from '../../../components/context/FullscreenContext';
import GamePageLayout from '../components/GamePageLayout';
import CardMatchGame from './CardMatchGame';

const CardMatchPage: React.FC = () => {
  const { isFullscreen } = useFullscreen();

  return (
    <GamePageLayout
      icon={<Extension />}
      title="Match Game"
      description="Match karate techniques with their descriptions"
      showHeader={!isFullscreen}
    >
      <DeckProvider>
        <CardProvider>
          <CardMatchGame />
        </CardProvider>
      </DeckProvider>
    </GamePageLayout>
  );
};

export default CardMatchPage;
