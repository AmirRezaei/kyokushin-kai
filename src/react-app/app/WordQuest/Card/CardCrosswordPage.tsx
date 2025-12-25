// File: ./src/app/WordQuest/Card/CardCrosswordPage.tsx

import React from 'react';
import { GridOn } from '@mui/icons-material';

import { DeckProvider } from './Deck/DeckContext';
import { CardProvider } from './CardContext';
import { useFullscreen } from '../../../components/context/FullscreenContext';
import GamePageLayout from '../components/GamePageLayout';
import CardCrossword from './CardCrossword';

const CardCrosswordPage: React.FC = () => {
  const { isFullscreen } = useFullscreen();

  return (
    <GamePageLayout
      icon={<GridOn />}
      title="Crossword Puzzle"
      description="Solve crossword puzzles using karate techniques and katas"
      showHeader={!isFullscreen}
    >
      <DeckProvider>
        <CardProvider>
          <CardCrossword />
        </CardProvider>
      </DeckProvider>
    </GamePageLayout>
  );
};

export default CardCrosswordPage;
