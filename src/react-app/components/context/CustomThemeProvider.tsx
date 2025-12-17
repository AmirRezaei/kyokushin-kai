// File: ./src/components/context/CustomThemeProvider.tsx

import {Box, CssBaseline, PaletteMode, responsiveFontSizes, ThemeProvider} from '@mui/material';
import {createTheme} from '@mui/material/styles';
import React, {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';

import {palettes} from '../palette/palettes';
import {ThemePalette} from '../palette/themePalettes';
import {getLocalStorageItem, setLocalStorageItem} from '../utils/localStorageUtils';

interface ThemeContextProps {
   isDarkMode: boolean;
   toggleDarkMode: () => void;
   currentPalette: string;
   setPalette: (paletteName: string) => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const useThemeContext = (): ThemeContextProps => {
   const context = useContext(ThemeContext);
   if (!context) {
      throw new Error('useThemeContext must be used within a CustomThemeProvider');
   }
   return context;
};

export const CustomThemeProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
   // State to manage dark mode
   const [isDarkMode, setIsDarkMode] = useState<boolean>(() => getLocalStorageItem<boolean>('darkMode', false));

   // State to manage current palette
   const [currentPaletteName, setCurrentPaletteName] = useState<string>(() => {
      const storedPalette = getLocalStorageItem<string>('palette', 'blue');
      return palettes[storedPalette] ? storedPalette : 'blue';
   });

   // Persist dark mode preference
   useEffect(() => {
      setLocalStorageItem('darkMode', isDarkMode);
   }, [isDarkMode]);

   // Persist palette preference
   useEffect(() => {
      setLocalStorageItem('palette', currentPaletteName);
   }, [currentPaletteName]);

   // Listen to storage changes for synchronization across tabs
   useEffect(() => {
      const handleStorageChange = (event: StorageEvent) => {
         if (event.key === 'darkMode') {
            const newValue = event.newValue ? JSON.parse(event.newValue) : false;
            setIsDarkMode(newValue);
         }
         if (event.key === 'palette') {
            const newPalette = event.newValue ? event.newValue : 'blue';
            if (palettes[newPalette]) {
               setCurrentPaletteName(newPalette);
            } else {
               setCurrentPaletteName('blue');
            }
         }
      };
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
   }, []);

   // Toggle dark mode
   const toggleDarkMode = useCallback(() => {
      setIsDarkMode(prevMode => !prevMode);
   }, []);

   // Set a new palette
   const setPalette = useCallback((paletteName: string) => {
      if (palettes[paletteName]) {
         setCurrentPaletteName(paletteName);
      } else {
         setCurrentPaletteName('blue'); // Fallback palette
      }
   }, []);

   // Memoize the theme to prevent unnecessary recalculations
   const theme = useMemo(() => {
      const mode: PaletteMode = isDarkMode ? 'dark' : 'light';
      const selectedPalette: ThemePalette = palettes[currentPaletteName][mode] || palettes['blue'][mode];

      let baseTheme = createTheme({
         palette: {
            ...selectedPalette,
            mode,
            // Optionally override background colors based on mode
            background: {
               default: selectedPalette.background.default,
               paper: selectedPalette.background.paper,
            },
         },
         typography: {
            // Customize typography here
            fontFamily: 'Roboto, sans-serif',
         },
      });

      // Make typography responsive
      baseTheme = responsiveFontSizes(baseTheme);
      return baseTheme;
   }, [isDarkMode, currentPaletteName]);

   // Context value
   const contextValue = useMemo(
      () => ({
         isDarkMode,
         toggleDarkMode,
         currentPalette: currentPaletteName,
         setPalette,
      }),
      [isDarkMode, toggleDarkMode, currentPaletteName, setPalette],
   );

   return (
      <ThemeContext.Provider value={contextValue}>
         <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box
               sx={{
                  width: '100%',
                  height: '100%',
                  minHeight: '100vh',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'flex-start',
                  backgroundColor: theme.palette.background.default,
                  padding: 0,
                  margin: 0,
                  transition: 'background-color 0.3s ease',
                  overflow: 'hidden',
                  position: 'relative',
               }}>
               {children}
            </Box>
         </ThemeProvider>
      </ThemeContext.Provider>
   );
};
