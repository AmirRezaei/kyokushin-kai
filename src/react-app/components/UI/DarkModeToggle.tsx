// HEADER-START
// * Path: ./src/components/UI/DarkModeToggle.tsx
// HEADER-END
import React, {useCallback} from 'react';

import {useThemeContext} from '../context/CustomThemeProvider';
import DarkModeSwitch from './DarkModeSwitch';

const DarkModeToggle: React.FC = React.memo(() => {
   const {isDarkMode, toggleDarkMode} = useThemeContext();

   // Memoize the toggle function to prevent unnecessary re-renders
   const handleToggle = useCallback(() => {
      toggleDarkMode();
   }, [toggleDarkMode]);

   return (
      <DarkModeSwitch
         checked={isDarkMode}
         onChange={handleToggle}
         inputProps={{
            'aria-label': 'toggle dark mode',
         }}
      />
   );
});

export default DarkModeToggle;
