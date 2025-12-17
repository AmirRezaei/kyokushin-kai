// HEADER-START
// * Path: ./src/components/palette/themePalettes.ts
// HEADER-END
// src/components/palette/themePalettes.ts

export interface ThemePalette {
   // Defines the color mode, either light or dark
   mode: 'light' | 'dark';

   // Primary color settings
   primary: {
      main: string;
      light?: string;
      dark?: string;
      contrastText?: string;
   };

   // Secondary color settings
   secondary: {
      main: string;
      light?: string;
      dark?: string;
      contrastText?: string;
   };

   // Error color settings
   error: {
      main: string;
      light?: string;
      dark?: string;
      contrastText?: string;
   };

   // Warning color settings
   warning: {
      main: string;
      light?: string;
      dark?: string;
      contrastText?: string;
   };

   // Info color settings
   info: {
      main: string;
      light?: string;
      dark?: string;
      contrastText?: string;
   };

   // Success color settings
   success: {
      main: string;
      light?: string;
      dark?: string;
      contrastText?: string;
   };

   // Background color settings
   background: {
      default: string;
      paper: string;
   };

   // Text color settings
   text: {
      primary: string;
      secondary: string;
      disabled?: string;
   };

   // Divider color
   divider: string;

   // Action color settings
   action: {
      active: string;
      hover: string;
      selected: string;
      disabled: string;
      disabledBackground: string;
   };

   // Common colors
   common: {
      black: string;
      white: string;
   };
}
