// File: ./src/app/WordQuest/Card/CardPage.tsx

import React from 'react';
import { School } from '@mui/icons-material';

import { DeckProvider } from './Deck/DeckContext';
import { CardProvider } from './CardContext';
import { useFullscreen } from '../../../components/context/FullscreenContext';
import GamePageLayout from '../components/GamePageLayout';
import CardPlayer from './CardPlayer';

const CardPage: React.FC = () => {
  const { isFullscreen } = useFullscreen();

  return (
    <GamePageLayout
      icon={<School />}
      title="Card Master"
      description="Master your karate techniques with interactive cards"
      showHeader={!isFullscreen}
    >
      <DeckProvider>
        <CardProvider>
          <CardPlayer />
        </CardProvider>
      </DeckProvider>
    </GamePageLayout>
  );
};

export default CardPage;
