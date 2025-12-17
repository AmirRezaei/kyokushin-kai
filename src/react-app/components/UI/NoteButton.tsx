// HEADER-START
// * Project: Kyokushin
// * Path: src/components/UI/NoteButton.tsx
// ! Purpose: [Action Required: Summarize the component or file purpose.]
//
// ! Tech Stack and Libraries:
// - Core Frameworks: React, Vite
// - UI/Styling: MUI v6, MUI X-Charts, MUI X Data Grid, MUI X Date and Time Pickers, MUI X Tree View, TailwindCSS
// - TypeScript: Strict Mode Enabled
// - Package Manager: Yarn
//
// ? Additional Libraries:
// - Drag-and-Drop: @dnd-kit/core, @dnd-kit/sortable
// - Utilities: Lodash, UUID, date-fns, tone
// - Data Handling: XLSX, react-papaparse
// - Icons: MUI Icons, React Icons
// - Routing: React Router DOM
//
// ! Development Environment:
// - OS: Windows
// - Tools: PowerShell, VSCode
//
// ! Coding Guidelines:
// 1. Purpose Summary: Provide a concise description of the file's role based on the "Purpose" section.
// 2. Code Quality: Ensure code is readable, maintainable, and optimized for performance.
// 3. State Management: Use immutable state updates and minimize state where possible.
// 4. Rendering Optimization: Utilize React.memo, useCallback, and useMemo to optimize rendering efficiency.
// 5. State Management Libraries: Avoid prop drilling by leveraging Context API or state management libraries.
// 6. Side Effects Management:
//    - Ensure useEffect hooks are idempotent and handle multiple invocations gracefully, especially under React Strict Mode.
//    - Clean up side effects in useEffect and manage dependencies carefully.
//    - Use centralize side-effect operations (e.g., localStorage interactions) to maintain data integrity and ease debugging.
//      - Use utility functions 'getLocalStorageItem' and 'setLocalStorageItem' located at @/components/utils/localStorageUtils.ts.
//        - Function Signatures:
//          - const getLocalStorageItem = <T,>(key: string, defaultValue: T): T
//          - const setLocalStorageItem = <T,>(key: string, value: T): void
//          - const getLocalStorageItems = <T extends object>(key: string,defaultValue: T[]): T[]
//          - const setLocalStorageItems = <T extends object>(key: string, value: T[]): void
//          - const deleteLocalStorageItemById = <T extends { id: string }>(key: string,id: string): void
// 7. Modularization: Break down large components into smaller, reusable parts.
// 8. Semantic HTML & Styling: Use semantic HTML elements and modular styling approaches (e.g., CSS modules, TailwindCSS).
// 9. Error Handling:
//    - Implement robust error handling.
//    - Provide user-friendly feedback in case of errors.
// 10. Reactive State: Utilize useState or useRef for reactive state management; avoid using global variables.
// 11. Security: Identify and mitigate potential security vulnerabilities (e.g., XSS, injection attacks).
// 12. Code Conciseness: Ensure all generated code is concise and excludes this header.
// 13. This app is a static site with client-side rendering (CSR) where all pages are pre-generated during the build and directly loaded into the browser (e.g., hosted on a static file server or CDN).
// 14. Avoid Duplicate Rendering during development builds due to React Strict Mode.
// HEADER-END
import ChatIconFilled from '@mui/icons-material/Chat';
import ChatIconOutlined from '@mui/icons-material/ChatOutlined';
import {Button, Checkbox, Container, Dialog, DialogActions, DialogContent, DialogTitle, TextField} from '@mui/material';
import React, {useCallback, useEffect, useState} from 'react';

import {deleteLocalStorageItemById, getLocalStorageItemById, setLocalStorageItemById} from '../utils/localStorageUtils';

interface Note {
   id: string;
   note: string;
}

interface NoteButtonProps {
   id: string;
   note: string;
}

const NoteButton: React.FC<NoteButtonProps> = ({id, note: title}) => {
   const [open, setOpen] = useState<boolean>(false);
   const [note, setNote] = useState<Note | undefined>(undefined);
   const [inputValue, setInputValue] = useState<string>('');
   const localStorageKey = `comments`;

   const loadNote = useCallback(() => {
      const savedNote = getLocalStorageItemById<Note>(localStorageKey, id);
      if (savedNote && savedNote.note !== undefined) {
         setNote(savedNote);
         setInputValue(savedNote.note);
      } else {
         setNote(undefined);
         setInputValue('');
      }
   }, [id]);

   useEffect(() => {
      loadNote();
   }, [loadNote]);

   const handleClickOpenDialog = () => {
      setOpen(true);
   };

   const handleCloseDialog = () => {
      setOpen(false);
   };

   const handleSave = () => {
      const newNote: Note = {id, note: inputValue};
      if (inputValue.length > 0) setLocalStorageItemById(localStorageKey, newNote);
      else deleteLocalStorageItemById(localStorageKey, id);

      setNote(newNote);
      setOpen(false);
   };

   const handleClear = () => {
      setInputValue('');
      setNote(undefined);
      setLocalStorageItemById(localStorageKey, {id, note: ''});
   };

   const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(event.target.value);
   };

   return (
      <Container>
         <Checkbox onChange={handleClickOpenDialog} checked={note !== undefined && note.note?.trim() !== ''} icon={note?.note?.trim() ? <ChatIconFilled /> : <ChatIconOutlined />} checkedIcon={<ChatIconFilled />} />
         <Dialog open={open} onClose={handleCloseDialog} fullWidth>
            <DialogTitle variant='h6'>{note ? title : 'Add Comment'}</DialogTitle>
            <DialogContent>
               <TextField autoFocus margin='dense' id={`notes-${id}`} label='Note' type='text' fullWidth rows={6} variant='outlined' value={inputValue} multiline onChange={handleInputChange} />
            </DialogContent>
            <DialogActions>
               <Button onClick={handleClear} disabled={inputValue.trim() === ''}>
                  Clear
               </Button>
               <Button onClick={handleCloseDialog}>Cancel</Button>
               <Button onClick={handleSave}>Save</Button>
            </DialogActions>
         </Dialog>
      </Container>
   );
};

export default NoteButton;
