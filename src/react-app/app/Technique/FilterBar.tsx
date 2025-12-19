// FilterBar.tsx - Sticky filter bar for TechniquePage
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { Box, TextField, InputAdornment, IconButton, Chip, Stack, Paper } from '@mui/material';
import React from 'react';

export type FilterType = 'all' | 'learning' | 'mastered';

interface FilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedType: string | null;
  onTypeChange: (type: string | null) => void;
  filterMode: FilterType;
  onFilterModeChange: (mode: FilterType) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  searchTerm,
  onSearchChange,
  selectedType,
  onTypeChange,
  filterMode,
  onFilterModeChange,
}) => {
  const techniqueTypes = ['Stand', 'Strike', 'Block', 'Kick', 'Kata', 'Fighting', 'Breathing'];
  const filterModes: { value: FilterType; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'learning', label: 'Learning' },
    { value: 'mastered', label: 'Mastered' },
  ];

  return (
    <Paper
      elevation={2}
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        p: 2,
        backgroundColor: 'background.paper',
      }}
    >
      {/* Search Field */}
      <TextField
        fullWidth
        size="small"
        placeholder="Search techniques..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
          endAdornment: searchTerm && (
            <InputAdornment position="end">
              <IconButton size="small" onClick={() => onSearchChange('')} edge="end">
                <ClearIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{ mb: 1.5 }}
      />

      {/* Progress Filter Chips */}
      <Stack direction="row" spacing={1} sx={{ mb: 1.5, flexWrap: 'wrap', gap: 1 }} useFlexGap>
        {filterModes.map((mode) => (
          <Chip
            key={mode.value}
            label={mode.label}
            onClick={() => onFilterModeChange(mode.value)}
            color={filterMode === mode.value ? 'primary' : 'default'}
            variant={filterMode === mode.value ? 'filled' : 'outlined'}
            size="small"
            sx={{ minWidth: 44, minHeight: 44 }} // Touch-friendly
          />
        ))}
      </Stack>

      {/* Type Filter Chips */}
      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }} useFlexGap>
        {techniqueTypes.map((type) => (
          <Chip
            key={type}
            label={type}
            onClick={() => onTypeChange(selectedType === type ? null : type)}
            color={selectedType === type ? 'secondary' : 'default'}
            variant={selectedType === type ? 'filled' : 'outlined'}
            size="small"
            sx={{ minWidth: 44, minHeight: 44 }} // Touch-friendly
          />
        ))}
      </Stack>
    </Paper>
  );
};

export default FilterBar;
