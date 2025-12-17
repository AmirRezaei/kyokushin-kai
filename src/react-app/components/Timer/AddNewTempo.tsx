// HEADER-START
// * Project: Kyokushin
// * Path: src/components/Timer/AddNewTempo.tsx
// ! Purpose: [Action Required: Summarize the component or file purpose.]
//
// ! Tech Stack and Libraries:
// - **Core Frameworks:** React, Next.js
// - **UI/Styling:** MUI v6, TailwindCSS
// - **TypeScript:** Strict Mode Enabled
// - **Package Manager:** Yarn
//
// ? Additional Libraries:
// - **Drag-and-Drop:** @dnd-kit/core, @dnd-kit/sortable
// - **Utilities:** Lodash, UUID
// - **Data Handling:** XLSX, react-papaparse
// - **Icons:** MUI Icons, React Icons
// - **Routing:** React Router DOM
//
// ! Development Environment:
// - **OS:** Windows
// - **Tools:** PowerShell, VSCode
//
// ! Coding Guidelines:
// 1. **Purpose Summary:** Provide a concise description of the file's role based on the "Purpose" section.
// 2. **Code Quality:** Ensure code is readable, maintainable, and optimized for performance.
// 3. **State Management:** Use immutable state updates and minimize state where possible.
// 4. **Rendering Optimization:** Utilize React.memo, useCallback, and useMemo to optimize rendering efficiency.
// 5. **State Management Libraries:** Avoid prop drilling by leveraging Context API or state management libraries.
// 6. **Side Effects Management:**
//    - Ensure useEffect hooks are idempotent and handle multiple invocations gracefully, especially under React Strict Mode.
//    - Clean up side effects in useEffect and manage dependencies carefully.
//    - Use centralize side-effect operations (e.g., localStorage interactions) to maintain data integrity and ease debugging.
//      - Use utility functions 'getLocalStorageItem' and 'setLocalStorageItem' located at src/components/utils/localStorageUtils.ts.
//        - **Function Signatures:**
//          - 'const getLocalStorageItem = <T,>(key: string, defaultValue: T): T'
//          - 'const setLocalStorageItem = <T,>(key: string, value: T): void'
// 7. **Modularization:** Break down large components into smaller, reusable parts.
// 8. **Semantic HTML & Styling:** Use semantic HTML elements and modular styling approaches (e.g., CSS modules, TailwindCSS).
// 9. **Error Handling:**
//    - Implement robust error handling.
//    - Use the Error Boundary component located at src/components/utils/ErrorBoundary.tsx to catch and handle JavaScript errors in the component tree.
//    - Provide user-friendly feedback in case of errors.
// 10. **Reactive State:** Utilize useState or useRef for reactive state management; avoid using global variables.
// 11. **Security:** Identify and mitigate potential security vulnerabilities (e.g., XSS, injection attacks).
// 12. **Code Conciseness:** Ensure all generated code is concise and excludes this header.
// HEADER-END
import {Box, Button, Paper, Slider, TextField, Typography} from '@mui/material';
import React, {useCallback, useRef, useState} from 'react';

interface AddNewTempoProps {
   onAddTempo: (newTempo: {label: string; bpm: number}) => void;
   existingBpm: number[];
}

export const AddNewTempo: React.FC<AddNewTempoProps> = ({onAddTempo, existingBpm}) => {
   const [newTempoLabel, setNewTempoLabel] = useState<string>('');
   const [newTempoBpm, setNewTempoBpm] = useState<number>(60);
   const isLabelManuallyEdited = useRef<boolean>(false);

   const handleLabelChange = useCallback((value: string) => {
      setNewTempoLabel(value);
      isLabelManuallyEdited.current = true;
   }, []);

   const handleSliderChange = useCallback((value: number) => {
      setNewTempoBpm(value);
      if (!isLabelManuallyEdited.current) {
         setNewTempoLabel(`BPM ${value}`);
      }
   }, []);

   const handleAddTempo = useCallback(() => {
      onAddTempo({label: newTempoLabel, bpm: newTempoBpm});
      setNewTempoLabel('');
      setNewTempoBpm(60);
      isLabelManuallyEdited.current = false;
   }, [onAddTempo, newTempoLabel, newTempoBpm]);

   const isDuplicateBpm = existingBpm.includes(newTempoBpm);

   return (
      <Paper elevation={3} sx={{p: 3}}>
         <Typography variant='h5' align='center' gutterBottom>
            Add New Tempo
         </Typography>
         <Box display='flex' flexDirection='column' gap={2}>
            <TextField label='New Tempo Label' value={newTempoLabel} onChange={e => handleLabelChange(e.target.value)} fullWidth placeholder={`BPM ${newTempoBpm}`} />
            <Slider value={newTempoBpm} min={30} max={300} step={5} valueLabelDisplay='on' onChange={(_, value) => handleSliderChange(value as number)} sx={{mb: 3, mt: 2}} />
            <Typography align='center'>New Tempo: {newTempoBpm} BPM</Typography>
            <Button variant='contained' onClick={handleAddTempo} disabled={isDuplicateBpm}>
               Add Tempo
            </Button>
            {isDuplicateBpm && (
               <Typography color='error' align='center'>
                  This BPM already exists.
               </Typography>
            )}
         </Box>
      </Paper>
   );
};
