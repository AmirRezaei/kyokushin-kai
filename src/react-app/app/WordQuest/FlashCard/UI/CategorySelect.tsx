// File: ./src/app/WordQuest/FlashCard/UI/CategorySelect.tsx

import {FormControl, InputLabel, MenuItem, Select, SelectChangeEvent} from '@mui/material';
import React from 'react';

import {useFlashCards} from '../FlashCardContext';

interface CategorySelectProps {
   handleCategoryChange: (event: SelectChangeEvent<string>) => void;
   selectedCategory: string;
}

const CategorySelect: React.FC<CategorySelectProps> = ({handleCategoryChange, selectedCategory}) => {
   const {flashCards} = useFlashCards();

   const categories = Array.from(new Set(flashCards.map(card => card.category).filter(Boolean)));

   return (
      <FormControl variant='outlined' sx={{minWidth: 120}}>
         <InputLabel id='category-select-label'>Category</InputLabel>
         <Select labelId='category-select-label' id='category-select' value={selectedCategory} onChange={handleCategoryChange} label='Category'>
            <MenuItem value='All'>All</MenuItem>
            {categories.map(category => (
               <MenuItem key={category} value={category}>
                  {category}
               </MenuItem>
            ))}
         </Select>
      </FormControl>
   );
};

export default CategorySelect;
