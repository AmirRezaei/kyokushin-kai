// HEADER-START
// * Project: Kyokushin
// * Path: src/components/Training/TrainingSessionForm.tsx
// ! Purpose: [Action Required: Summarize the component or file purpose.]
//
// ! Tech Stack and Libraries:
// - Core Frameworks: React, Vite
// - UI/Styling: MUI v6, MUI X Charts, MUI X Data Grid, MUI X Date and Time Pickers, MUI X Tree View, TailwindCSS
// - TypeScript: Strict Mode Enabled
// - Package Manager: Yarn
//
// ? Additional Libraries:
// - Drag-and-Drop: @dnd-kit/core, @dnd-kit/sortable
// - Utilities: Lodash, UUID
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
//          - 'const getLocalStorageItem = <T,>(key: string, defaultValue: T): T'
//          - 'const setLocalStorageItem = <T,>(key: string, value: T): void'
// 7. Modularization: Break down large components into smaller, reusable parts.
// 8. Semantic HTML & Styling: Use semantic HTML elements and modular styling approaches (e.g., CSS modules, TailwindCSS).
// 9. Error Handling:
//    - Implement robust error handling.
//    - Provide user-friendly feedback in case of errors.
// 10. Reactive State: Utilize useState or useRef for reactive state management; avoid using global variables.
// 11. Security: Identify and mitigate potential security vulnerabilities (e.g., XSS, injection attacks).
// 12. Code Conciseness: Ensure all generated code is concise and excludes this header.
// 13  This app is a static site with client-side rendering (CSR) where all pages are pre-generated during the build and directly loaded into the browser (e.g., hosted on a static file server or CDN).
// HEADER-END
import {Box, Button, MenuItem, TextField, Typography} from '@mui/material';
import React, {useEffect, useState} from 'react';

interface TrainingSession {
   date: string;
   type: string;
   duration: number;
   intensity: string;
   notes: string;
}

interface TrainingSessionFormProps {
   onAddSession: (session: TrainingSession) => void;
   initialData?: TrainingSession;
   isEditMode?: boolean;
}

const TrainingSessionForm: React.FC<TrainingSessionFormProps> = ({onAddSession, initialData, isEditMode = false}) => {
   const [formData, setFormData] = useState<TrainingSession>({
      date: '',
      type: '',
      duration: 0,
      intensity: '',
      notes: '',
   });

   useEffect(() => {
      if (initialData) {
         setFormData(initialData);
      }
   }, [initialData]);

   const handleChange = (field: keyof TrainingSession) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = field === 'duration' ? Number(e.target.value) : e.target.value;
      setFormData({...formData, [field]: value});
   };

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onAddSession(formData);
      if (!isEditMode) {
         setFormData({
            date: '',
            type: '',
            duration: 0,
            intensity: '',
            notes: '',
         });
      }
   };

   return (
      <Box component='form' onSubmit={handleSubmit} sx={{p: 2, maxWidth: 400, margin: '0 auto'}}>
         <Typography variant='h6' mb={2}>
            {isEditMode ? 'Edit Training Session' : 'Log Training Session'}
         </Typography>
         <TextField label='Date' type='date' value={formData.date} onChange={handleChange('date')} fullWidth required InputLabelProps={{shrink: true}} sx={{mb: 2}} />
         <TextField label='Type' select value={formData.type} onChange={handleChange('type')} fullWidth required sx={{mb: 2}}>
            {['Kata', 'Kumite', 'Kihon', 'Conditioning'].map(type => (
               <MenuItem key={type} value={type}>
                  {type}
               </MenuItem>
            ))}
         </TextField>
         <TextField label='Duration (minutes)' type='number' value={formData.duration} onChange={handleChange('duration')} fullWidth required sx={{mb: 2}} />
         <TextField label='Intensity' select value={formData.intensity} onChange={handleChange('intensity')} fullWidth required sx={{mb: 2}}>
            {['Light', 'Moderate', 'Intense'].map(level => (
               <MenuItem key={level} value={level}>
                  {level}
               </MenuItem>
            ))}
         </TextField>
         <TextField label='Notes' multiline rows={4} value={formData.notes} onChange={handleChange('notes')} fullWidth sx={{mb: 2}} />
         <Button type='submit' variant='contained' color='primary' fullWidth>
            {isEditMode ? 'Update Session' : 'Add Session'}
         </Button>
      </Box>
   );
};

export default TrainingSessionForm;
