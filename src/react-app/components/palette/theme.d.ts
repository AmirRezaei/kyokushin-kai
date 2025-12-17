// HEADER-START
// * Path: ./src/components/palette/theme.d.ts
// HEADER-END

import {PaletteOptions} from '@mui/material/styles/createPalette';

declare module '@mui/material/styles' {
   interface Palette {
      nonPhotoBlue: string;
      cerise: string;
      timberwolf: string;
      orangeCrayola: string;
      periwinkle: string;
      verdigris: string;
      celadon: string;
      glaucous: string;
      fairyTale: string;
      gradients: {
         top: string;
         right: string;
         bottom: string;
         left: string;
         topRight: string;
         bottomRight: string;
         topLeft: string;
         bottomLeft: string;
         radial: string;
      };
   }

   interface PaletteOptions {
      nonPhotoBlue?: string;
      cerise?: string;
      timberwolf?: string;
      orangeCrayola?: string;
      periwinkle?: string;
      verdigris?: string;
      celadon?: string;
      glaucous?: string;
      fairyTale?: string;
      gradients?: {
         top?: string;
         right?: string;
         bottom?: string;
         left?: string;
         topRight?: string;
         bottomRight?: string;
         topLeft?: string;
         bottomLeft?: string;
         radial?: string;
      };
   }
}
