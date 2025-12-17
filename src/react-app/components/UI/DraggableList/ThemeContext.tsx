// HEADER-START
// * Path: ./src/components/UI/DraggableList/ThemeContext.tsx
// HEADER-END

import {createTheme, Theme,ThemeProvider} from '@mui/material/styles';
import React, {createContext, ReactNode,useMemo, useState} from 'react';

// Define the shape of the context
interface ThemeContextProps {
   currentPalette: PaletteName;
   setPalette: (palette: PaletteName) => void;
}

// Define available palette names
export type PaletteName = 'light' | 'dark' | 'blue' | 'green';

// Create the context with default values
export const ThemeContext = createContext<ThemeContextProps>({
   currentPalette: 'light',
   setPalette: () => {},
});

// Define available palette configurations
const getPalette = (paletteName: PaletteName) => {
   switch (paletteName) {
      case 'dark':
         return {
            mode: 'dark' as const,
            primary: {
               main: '#90caf9',
            },
            secondary: {
               main: '#f48fb1',
            },
         };
      case 'blue':
         return {
            mode: 'light' as const,
            primary: {
               main: '#1976d2',
            },
            secondary: {
               main: '#ef5350',
            },
         };
      case 'green':
         return {
            mode: 'light' as const,
            primary: {
               main: '#388e3c',
            },
            secondary: {
               main: '#ffb74d',
            },
         };
      case 'light':
      default:
         return {
            mode: 'light' as const,
            primary: {
               main: '#1976d2',
            },
            secondary: {
               main: '#dc004e',
            },
         };
   }
};

// Create a provider component
interface ThemeProviderProps {
   children: ReactNode;
}

export const CustomThemeProvider: React.FC<ThemeProviderProps> = ({children}) => {
   const [palette, setPalette] = useState<PaletteName>('light');

   const theme: Theme = useMemo(
      () =>
         createTheme({
            palette: getPalette(palette),
         }),
      [palette],
   );

   const contextValue: ThemeContextProps = useMemo(
      () => ({
         currentPalette: palette,
         setPalette,
      }),
      [palette],
   );

   return (
      <ThemeContext.Provider value={contextValue}>
         <ThemeProvider theme={theme}>{children}</ThemeProvider>
      </ThemeContext.Provider>
   );
};
