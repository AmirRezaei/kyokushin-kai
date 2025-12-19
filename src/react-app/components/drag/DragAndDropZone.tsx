// File: ./src/components/drag/DragAndDropZone.tsx

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  rectIntersection,
  SensorDescriptor,
  SensorOptions,
} from '@dnd-kit/core';
import { rectSortingStrategy, SortableContext } from '@dnd-kit/sortable';
import { Box, Paper, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import React from 'react';

import { TechniqueRecord } from '../../../data/model/technique';
import { getTechniqueCorrectOrder } from '../../../data/repo/techniqueHelpers';
import DropZone from '@/components/drag/DropZone';

import SortableItem from './SortableItem';

interface DragAndDropZoneProps {
  items: {
    [key: string]: string[];
  };
  currentTechnique: TechniqueRecord | null;
  sensors: SensorDescriptor<SensorOptions>[];
  activeId: string | null;
  handleDragStart: (event: DragStartEvent) => void;
  handleDragEnd: (event: DragEndEvent) => void;
  hintedWordIds: string[];
}

const DragAndDropZone: React.FC<DragAndDropZoneProps> = ({
  items,
  currentTechnique,
  sensors,
  activeId,
  handleDragStart,
  handleDragEnd,
  hintedWordIds,
}) => {
  const theme = useTheme();

  return (
    <Paper
      sx={{
        backgroundColor: theme.palette.background.default,
        borderRadius: 2,
        pl: 1,
        pr: 1,
        marginTop: 1,
        marginDown: 1,
      }}
    >
      <Typography variant="body1" gutterBottom align="center">
        Drag words here to assemble the word or sentence
      </Typography>
      <DndContext
        sensors={sensors}
        collisionDetection={rectIntersection}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <DropZone id="assembledWords">
          <SortableContext
            items={items.assembledWords.map((word, index) => `${word}-${index}`)}
            strategy={rectSortingStrategy}
            key="assembledWordsContext"
          >
            {items.assembledWords.map((word, index) => {
              const correctOrder = currentTechnique
                ? getTechniqueCorrectOrder(currentTechnique)
                : [];
              return (
                <SortableItem
                  key={`${word}-${index}`}
                  id={`${word}-${index}`}
                  text={word}
                  correctPosition={correctOrder[index] === word}
                />
              );
            })}
          </SortableContext>
        </DropZone>

        <Typography variant="body1" align="center" gutterBottom sx={{ mt: 2 }}>
          Available Words
        </Typography>
        <DropZone id="availableWords">
          <SortableContext
            items={items.availableWords.map((word, index) => `${word}-${index}`)}
            strategy={rectSortingStrategy}
            key="availableWordsContext"
          >
            {items.availableWords.map((word, index) => (
              <SortableItem
                key={`${word}-${index}`}
                id={`${word}-${index}`}
                text={word}
                isHinted={hintedWordIds.includes(word)}
              />
            ))}
          </SortableContext>
        </DropZone>

        <DragOverlay>
          {activeId
            ? (() => {
                const word = activeId.split('-')[0];
                return word ? (
                  <Box
                    sx={{
                      height: '30%',
                      margin: 0.1,
                      padding: 3,
                      boxShadow: 2,
                      borderWidth: 3,
                      borderStyle: 'solid',
                      borderColor: 'primary.main',
                      backgroundColor: 'grey.300',
                      color: 'text.primary',
                      borderRadius: 5,
                      zIndex: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      textAlign: 'center',
                      whiteSpace: 'normal',
                      overflow: 'hidden',
                    }}
                  >
                    {word}
                  </Box>
                ) : null;
              })()
            : null}
        </DragOverlay>
      </DndContext>

      {currentTechnique && (
        <Typography variant="h6" gutterBottom sx={{ mt: 2, mb: 2, textAlign: 'center' }}>
          {currentTechnique.name.en || currentTechnique.name.romaji}
        </Typography>
      )}
    </Paper>
  );
};

export default DragAndDropZone;
