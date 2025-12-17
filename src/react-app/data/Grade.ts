// HEADER-START
// * Path: ./src/data/Grade.ts
// HEADER-END
import {Theme} from '@mui/material';
import {darken, lighten} from '@mui/system';

import {Technique} from '@/app/Technique/TechniqueData';
import {adjustedColor, colorMap, getHexColor} from '@/components/helper/HelperColor';

import {beltNames} from './beltNames';
import {Kata} from './Kata';

export class Grade {
   id: string;
   rankName: string;
   kyuNumber: number;
   danNumber: number;
   beltColor: string;
   techniques: Technique[];
   katas: Kata[];

   constructor(id: string, rankName: string, kyuNumber: number, danNumber: number, beltColor: string, techniques: Technique[], katas: Kata[]) {
      this.id = id;
      this.rankName = rankName;
      this.kyuNumber = kyuNumber;
      this.danNumber = danNumber;
      this.beltColor = beltColor;
      this.techniques = techniques;
      this.katas = katas;
   }

   get beltTextColor(): string {
      return adjustedColor(colorMap[this.beltColor]);
   }

   lightBeltColor(percent: number): string {
      const color = getHexColor(this.beltColor);
      return lighten(color, percent);
   }

   get darkBeltColor(): string {
      const color = getHexColor(this.beltColor);
      return darken(color, 0.8);
   }

   // Method to adjust belt color based on theme
   getAdjustedBeltColor(theme: Theme): string {
      // Convert named color to hex if necessary
      const color = getHexColor(this.beltColor);

      return theme.palette.mode === 'dark'
         ? darken(color, 0.2) // Darken by 20%
         : lighten(color, 0.0); // Lighten by 0%
   }

   // Getter for belt name based on levelNumber.
   // Returns the name of the belt color associated with the calculated level, or "Unknown" if out of range.
   get beltName(): string {
      return beltNames[this.levelNumber] || 'Unknown';
   }

   // Calculates levelNumber based on kyuNumber and danNumber.
   // Getter for levelNumber, starts at 0 for (White, Mukyu), 1 for orange, 2 for orange with 1 stripe... 11 for black etc.
   get levelNumber(): number {
      return this.kyuNumber > 0 ? 11 - this.kyuNumber : 10 + this.danNumber;
   }

   // Checks if the rank is intermediate (e.g., "1 Stripe" Kyu belts), typically non-black and odd-numbered Kyu levels.
   get isIntermediate(): boolean {
      return this.kyuNumber === 11 ? false : this.kyuNumber % 2 === 1 && this.danNumber === 0;
   }

   get hasDan(): boolean {
      return this.danNumber > 0;
   }
   get hasStripe(): boolean {
      return this.isIntermediate || this.hasDan;
   }

   get stripeNumber(): number {
      return this.isIntermediate ? 1 : this.hasDan ? this.danNumber : 0;
   }

   get hasTechniques(): boolean {
      return this.techniques.length > 0;
   }
}
