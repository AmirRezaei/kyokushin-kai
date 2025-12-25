// File: ./src/app/WordQuest/Card/DeckManagerPage.tsx

import React from 'react';
import { LibraryBooks } from '@mui/icons-material';

import { DeckProvider } from './Deck/DeckContext';
import { CardProvider } from './CardContext';
import { useFullscreen } from '../../../components/context/FullscreenContext';
import GamePageLayout from '../components/GamePageLayout';
import DeckManager from './Deck/DeckManager';

const DeckManagerPage: React.FC = () => {
  const { isFullscreen } = useFullscreen();

  return (
    <GamePageLayout
      icon={<LibraryBooks />}
      title="Deck Manager"
      description="Organize your cards into custom decks"
      showHeader={!isFullscreen}
    >
      <DeckProvider>
        <CardProvider>
          <DeckManager />
        </CardProvider>
      </DeckProvider>
    </GamePageLayout>
  );
};

export default DeckManagerPage;
