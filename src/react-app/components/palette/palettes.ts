// HEADER-START
// * Path: ./src/components/palette/palettes.ts
// HEADER-END

import {ThemePalette} from './themePalettes';

export const palettes: {
   [key: string]: {light: ThemePalette; dark: ThemePalette};
} = {
   // Blue Palette
   blue: {
      light: {
         mode: 'light',
         primary: {
            main: '#1976d2',
            light: '#63a4ff',
            dark: '#004ba0',
            contrastText: '#ffffff',
         },
         secondary: {
            main: '#dc004e',
            light: '#ff5c8d',
            dark: '#9a0036',
            contrastText: '#ffffff',
         },
         error: {
            main: '#f44336',
            light: '#e57373',
            dark: '#d32f2f',
            contrastText: '#ffffff',
         },
         warning: {
            main: '#ffa000',
            light: '#ffb74d',
            dark: '#f57c00',
            contrastText: '#ffffff',
         },
         info: {
            main: '#0288d1',
            light: '#03a9f4',
            dark: '#01579b',
            contrastText: '#ffffff',
         },
         success: {
            main: '#2e7d32',
            light: '#60ad5e',
            dark: '#1b5e20',
            contrastText: '#ffffff',
         },
         background: {
            default: '#f5f5f5',
            paper: '#ffffff',
         },
         text: {
            primary: '#000000',
            secondary: '#555555',
            disabled: '#9e9e9e',
         },
         divider: '#e0e0e0',
         action: {
            active: '#1976d2',
            hover: '#e3f2fd',
            selected: '#bbdefb',
            disabled: '#f5f5f5',
            disabledBackground: '#eeeeee',
         },
         common: {
            black: '#000000',
            white: '#ffffff',
         },
      },
      dark: {
         mode: 'dark',
         primary: {
            main: '#90caf9',
            light: '#e3f2fd',
            dark: '#42a5f5',
            contrastText: '#000000',
         },
         secondary: {
            main: '#f48fb1',
            light: '#f8bbd0',
            dark: '#f06292',
            contrastText: '#000000',
         },
         error: {
            main: '#ef9a9a',
            light: '#ff8a80',
            dark: '#e57373',
            contrastText: '#000000',
         },
         warning: {
            main: '#ffb74d',
            light: '#ffcc80',
            dark: '#ffa726',
            contrastText: '#000000',
         },
         info: {
            main: '#81d4fa',
            light: '#b3e5fc',
            dark: '#4fc3f7',
            contrastText: '#000000',
         },
         success: {
            main: '#a5d6a7',
            light: '#c8e6c9',
            dark: '#81c784',
            contrastText: '#000000',
         },
         background: {
            default: '#303030',
            paper: '#424242',
         },
         text: {
            primary: '#ffffff',
            secondary: '#bbbbbb',
            disabled: '#757575',
         },
         divider: '#616161',
         action: {
            active: '#90caf9',
            hover: '#424242',
            selected: '#616161',
            disabled: '#757575',
            disabledBackground: '#424242',
         },
         common: {
            black: '#000000',
            white: '#ffffff',
         },
      },
   },

   // Green Palette
   green: {
      light: {
         mode: 'light',
         primary: {
            main: '#388e3c',
            light: '#60ad5e',
            dark: '#1b5e20',
            contrastText: '#ffffff',
         },
         secondary: {
            main: '#fbc02d',
            light: '#fff176',
            dark: '#f9a825',
            contrastText: '#ffffff',
         },
         error: {
            main: '#d32f2f',
            light: '#ff6659',
            dark: '#9a0007',
            contrastText: '#ffffff',
         },
         warning: {
            main: '#ffa000',
            light: '#ffd54f',
            dark: '#ff8f00',
            contrastText: '#ffffff',
         },
         info: {
            main: '#0288d1',
            light: '#03a9f4',
            dark: '#01579b',
            contrastText: '#ffffff',
         },
         success: {
            main: '#2e7d32',
            light: '#60ad5e',
            dark: '#1b5e20',
            contrastText: '#ffffff',
         },
         background: {
            default: '#e8f5e9',
            paper: '#c8e6c9',
         },
         text: {
            primary: '#000000',
            secondary: '#555555',
            disabled: '#9e9e9e',
         },
         divider: '#a5d6a7',
         action: {
            active: '#388e3c',
            hover: '#c8e6c9',
            selected: '#81c784',
            disabled: '#e0e0e0',
            disabledBackground: '#f5f5f5',
         },
         common: {
            black: '#000000',
            white: '#ffffff',
         },
      },
      dark: {
         mode: 'dark',
         primary: {
            main: '#81c784',
            light: '#a5d6a7',
            dark: '#388e3c',
            contrastText: '#000000',
         },
         secondary: {
            main: '#ffeb3b',
            light: '#ffff72',
            dark: '#c6a700',
            contrastText: '#000000',
         },
         error: {
            main: '#ef5350',
            light: '#ff867c',
            dark: '#c62828',
            contrastText: '#000000',
         },
         warning: {
            main: '#ffee58',
            light: '#ffff8d',
            dark: '#c0ca33',
            contrastText: '#000000',
         },
         info: {
            main: '#29b6f6',
            light: '#4fc3f7',
            dark: '#0288d1',
            contrastText: '#000000',
         },
         success: {
            main: '#66bb6a',
            light: '#81c784',
            dark: '#388e3c',
            contrastText: '#000000',
         },
         background: {
            default: '#1b5e20',
            paper: '#2e7d32',
         },
         text: {
            primary: '#ffffff',
            secondary: '#bbbbbb',
            disabled: '#757575',
         },
         divider: '#4caf50',
         action: {
            active: '#81c784',
            hover: '#2e7d32',
            selected: '#388e3c',
            disabled: '#616161',
            disabledBackground: '#424242',
         },
         common: {
            black: '#000000',
            white: '#ffffff',
         },
      },
   },
   purple: {
      light: {
         mode: 'light',
         primary: {
            main: '#9c27b0',
            light: '#d05ce3',
            dark: '#6a0080',
            contrastText: '#ffffff',
         },
         secondary: {
            main: '#ff5722',
            light: '#ff8a50',
            dark: '#c41c00',
            contrastText: '#ffffff',
         },
         error: {
            main: '#f44336',
            light: '#e57373',
            dark: '#d32f2f',
            contrastText: '#ffffff',
         },
         warning: {
            main: '#ff9800',
            light: '#ffb74d',
            dark: '#f57c00',
            contrastText: '#ffffff',
         },
         info: {
            main: '#03a9f4',
            light: '#4fc3f7',
            dark: '#0288d1',
            contrastText: '#ffffff',
         },
         success: {
            main: '#4caf50',
            light: '#81c784',
            dark: '#388e3c',
            contrastText: '#ffffff',
         },
         background: {
            default: '#fafafa',
            paper: '#ffffff',
         },
         text: {
            primary: '#000000',
            secondary: '#555555',
            disabled: '#9e9e9e',
         },
         divider: '#e0e0e0',
         action: {
            active: '#9c27b0',
            hover: '#f3e5f5',
            selected: '#ce93d8',
            disabled: '#f5f5f5',
            disabledBackground: '#eeeeee',
         },
         common: {
            black: '#000000',
            white: '#ffffff',
         },
      },
      dark: {
         mode: 'dark',
         primary: {
            main: '#ce93d8',
            light: '#f3e5f5',
            dark: '#ba68c8',
            contrastText: '#000000',
         },
         secondary: {
            main: '#ffab91',
            light: '#ffcba4',
            dark: '#ff7043',
            contrastText: '#000000',
         },
         error: {
            main: '#ef9a9a',
            light: '#ff8a80',
            dark: '#e57373',
            contrastText: '#000000',
         },
         warning: {
            main: '#ffd54f',
            light: '#ffe082',
            dark: '#ffb300',
            contrastText: '#000000',
         },
         info: {
            main: '#29b6f6',
            light: '#4fc3f7',
            dark: '#0288d1',
            contrastText: '#000000',
         },
         success: {
            main: '#81c784',
            light: '#a5d6a7',
            dark: '#388e3c',
            contrastText: '#000000',
         },
         background: {
            default: '#424242',
            paper: '#616161',
         },
         text: {
            primary: '#ffffff',
            secondary: '#bbbbbb',
            disabled: '#757575',
         },
         divider: '#757575',
         action: {
            active: '#ce93d8',
            hover: '#5e35b1',
            selected: '#8e24aa',
            disabled: '#757575',
            disabledBackground: '#616161',
         },
         common: {
            black: '#000000',
            white: '#ffffff',
         },
      },
   },
};
