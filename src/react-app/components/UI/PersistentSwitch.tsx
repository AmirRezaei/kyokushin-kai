// HEADER-START
// * Project: Kyokushin
// * Path: src/components/UI/PersistentSwitch.tsx
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
//      - Use utility functions in @/components/utils/localStorageUtils.ts.
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

import FormControlLabel from '@mui/material/FormControlLabel';
import React, {useCallback, useEffect, useState} from 'react';

import {getLocalStorageItem, setLocalStorageItem} from '@/components/utils/localStorageUtils';
import {notifySettingsChanged} from '@/services/userSettingsService';

import {Android12Switch} from './Android12Switch';

interface PersistentSwitchProps {
   label: string;
   storageKey: string;
   defaultChecked?: boolean;
   onChange?: (checked: boolean) => void;
}

const PersistentSwitch: React.FC<PersistentSwitchProps> = ({label, storageKey, defaultChecked = false, onChange}) => {
   const [checked, setChecked] = useState<boolean>(defaultChecked);
   const [error, setError] = useState<string | null>(null);

   // Fetch the saved state from localStorage when the component mounts or storageKey changes
   useEffect(() => {
      try {
         const saved: boolean = getLocalStorageItem<boolean>(storageKey, defaultChecked);
         setChecked(saved);
      } catch (err) {
         console.error(`Error retrieving ${storageKey} from localStorage:`, err);
         setError('Failed to load switch state.');
      }
   }, [storageKey, defaultChecked]);

   // Handle switch state changes
   const handleChange = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
         const newChecked: boolean = event.target.checked;
         try {
            setChecked(newChecked);
            setLocalStorageItem(storageKey, newChecked);
            notifySettingsChanged();
            onChange?.(newChecked);
         } catch (err) {
            console.error(`Error setting ${storageKey} in localStorage:`, err);
            setError('Failed to save switch state.');
         }
      },
      [onChange, storageKey],
   );

   if (error) {
      return <div className='text-red-500'>{error}</div>;
   }

   return <FormControlLabel control={<Android12Switch checked={checked} onChange={handleChange} />} label={label} />;
};

export default React.memo(PersistentSwitch);
