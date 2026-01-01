import { Verified } from '@mui/icons-material';
import {
  FormControl,
  InputLabel,
  ListSubheader,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  Tooltip,
} from '@mui/material';
import React, { useMemo } from 'react';

import KarateBelt from '@/components/UI/KarateBelt';
import { getBeltColorHex, getStripeNumber } from '../../../../../data/repo/gradeHelpers';
import { useCurriculumGrades } from '@/hooks/useCatalog';

import { useDecks } from './DeckContext';

interface DeckSelectorProps {
  selectedDeckId: string;
  onDeckChange: (deckId: string) => void;
  label?: string;
  includeAllOption?: boolean;
  filterEmpty?: boolean;
  showCounts?: boolean;
}

const DeckSelector: React.FC<DeckSelectorProps> = ({
  selectedDeckId,
  onDeckChange,
  label = 'Select Deck',
  includeAllOption = false,
  filterEmpty = false,
  showCounts = false,
}) => {
  const { decks } = useDecks();
  const { grades } = useCurriculumGrades();

  const { systemDecks, userDecks } = useMemo(() => {
    let availableDecks = decks;

    if (filterEmpty) {
      availableDecks = availableDecks.filter((d) => d.cardIds.length > 0);
    }

    const sys = availableDecks.filter((d) => d.id.startsWith('deck-'));
    const usr = availableDecks.filter((d) => !d.id.startsWith('deck-'));

    return { systemDecks: sys, userDecks: usr };
  }, [decks, filterEmpty]);

  // Pre-fetch grades for system decks to avoid repetitive lookups in render
  const systemDecksWithGrades = useMemo(() => {
    const gradeMap = new Map(grades.map((g) => [g.id, g]));

    return systemDecks.map((deck) => {
      const gradeId = deck.id.replace('deck-', '');
      const grade = gradeMap.get(gradeId);
      return { deck, grade };
    });
  }, [systemDecks, grades]);

  const handleChange = (event: SelectChangeEvent) => {
    onDeckChange(event.target.value as string);
  };

  return (
    <FormControl fullWidth variant="outlined">
      <InputLabel>{label}</InputLabel>
      <Select value={selectedDeckId} onChange={handleChange} label={label}>
        {includeAllOption && <MenuItem value="All">All Decks</MenuItem>}

        {/* System Decks */}
        {systemDecksWithGrades.length > 0 && <ListSubheader>System Decks</ListSubheader>}
        {systemDecksWithGrades.map(({ deck, grade }) => (
          <MenuItem key={deck.id} value={deck.id}>
            <Stack direction="row" alignItems="center" gap={1}>
              {grade && (
                <KarateBelt
                  color={getBeltColorHex(grade.beltColor)}
                  stripes={getStripeNumber(grade)}
                  thickness="4px"
                  borderRadius="5px"
                  orientation="horizontal"
                  sx={{ height: '1.5rem', width: '3rem', mr: 1 }}
                />
              )}
              <Tooltip title="System Deck">
                <Stack direction="row" alignItems="center" gap={0.5}>
                  <Verified color="primary" fontSize="small" />
                  {deck.name}
                </Stack>
              </Tooltip>
              {showCounts && `(${deck.cardIds.length} Items)`}
            </Stack>
          </MenuItem>
        ))}

        {/* User Decks */}
        {userDecks.length > 0 && <ListSubheader>Custom Decks</ListSubheader>}
        {userDecks.map((deck) => (
          <MenuItem key={deck.id} value={deck.id}>
            {deck.name}
            {showCounts && ` (${deck.cardIds.length} Items)`}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default DeckSelector;
