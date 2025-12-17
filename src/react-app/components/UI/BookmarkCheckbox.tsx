// HEADER-START
// * Project: Kyokushin
// * Path: src/components/BookmarkCheckbox.tsx
// ! Purpose: [Action Required: Update this description to summarize the component or file purpose.]
// * Tech Stack: React, Next.js, MUI, TypeScript (Strict), TailwindCSS
// * Package Manager: Yarn
//
// ? Additional Libraries:
// - Drag-and-Drop: @dnd-kit/core, @dnd-kit/sortable
// - Utilities: Lodash, LINQ, UUID
// - Data Handling: XLSX, react-papaparse
// - Icons: MUI Icons, React Icons
// - Routing: React Router DOM
//
// ? LLM Action Items:
// 1. Update the "Purpose" section with a concise summary of the component's role.
// 2. Identify potential issues in the file and suggest improvements.
// 3. Suggest enhancements for code readability, maintainability, or scalability.
// 4. Optimize for performance where applicable (e.g., memoization, render efficiency).
// 5. Identify missing error handling and recommend robust solutions.
// 6. Highlight any potential security vulnerabilities (e.g., XSS, injection attacks).
// 7. Do not include header section into your code.
// 8. Always provide compact code with minimum formatting.
// HEADER-END

// ./src/components/BookmarkCheckbox.tsx
'use client';
// ./src/components/BookmarkCheckbox.tsx
import BookmarkBorderOutlinedIcon from '@mui/icons-material/BookmarkBorderOutlined';
import BookmarkOutlinedIcon from '@mui/icons-material/BookmarkOutlined';
import Checkbox from '@mui/material/Checkbox';
import * as React from 'react';

const label = {inputProps: {'aria-label': 'Checkbox demo'}};

export const getBookmarkById = (id: number): boolean => {
   const item = localStorage.getItem(`bookmark-checkbox-${id}`);
   return item !== null ? JSON.parse(item) : false;
};

export const setBookmarkById = (id: number, value: boolean): void => {
   localStorage.setItem(`bookmark-checkbox-${id}`, JSON.stringify(value));
};

interface BookmarkCheckboxProps {
   id: number;
}

export const BookmarkCheckbox: React.FC<BookmarkCheckboxProps> = ({id}) => {
   const [checked, setChecked] = React.useState<boolean>(false);

   React.useEffect(() => {
      const savedState = getBookmarkById(id);
      setChecked(savedState);
   }, [id]);

   const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const newChecked = event.target.checked;
      setChecked(newChecked);
      setBookmarkById(id, newChecked);
   };

   return (
      <div>
         <Checkbox {...label} icon={<BookmarkBorderOutlinedIcon />} checkedIcon={<BookmarkOutlinedIcon />} checked={checked} onChange={handleChange} />
      </div>
   );
};

export default BookmarkCheckbox;
