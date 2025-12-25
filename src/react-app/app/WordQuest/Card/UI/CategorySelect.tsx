// File: ./src/app/WordQuest/Card/UI/CategorySelect.tsx

import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import React from 'react';

import { useCards } from '../CardContext';

interface CategorySelectProps {
  handleCategoryChange: (event: SelectChangeEvent<string>) => void;
  selectedCategory: string;
}

const CategorySelect: React.FC<CategorySelectProps> = ({
  handleCategoryChange,
  selectedCategory,
}) => {
  const { cards } = useCards();

  const categories = Array.from(new Set(cards.map((card) => card.category).filter(Boolean)));

  return (
    <FormControl variant="outlined" sx={{ minWidth: 120 }}>
      <InputLabel id="category-select-label">Category</InputLabel>
      <Select
        labelId="category-select-label"
        id="category-select"
        value={selectedCategory}
        onChange={handleCategoryChange}
        label="Category"
      >
        <MenuItem value="All">All</MenuItem>
        {categories.map((category) => (
          <MenuItem key={category} value={category}>
            {category}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default CategorySelect;
