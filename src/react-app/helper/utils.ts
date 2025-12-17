// HEADER-START
// * Project: Kyokushin
// * Path: src/helper/utils.ts
// ! Purpose: [Action Required: Update this description to summarize the component or file purpose.]
// * Tech Stack: React, Next.js, MUI, TypeScript (Strict), TailwindCSS
// * Package Manager: Yarn
//
// ? Additional Libraries:
// - Drag-and-Drop: @dnd-kit/core, @dnd-kit/sortable
// - Utilities: Lodash, LINQ, UUID
// - Data Handling: XLSX, react-papaparse
// - Icons: MUI Icons, React Icons
// - Routing: React Router DOM
//
// ? LLM Action Items:
// 1. Update the "Purpose" section with a concise summary of the component's role.
// 2. Identify potential issues in the file and suggest improvements.
// 3. Suggest enhancements for code readability, maintainability, or scalability.
// 4. Optimize for performance where applicable (e.g., memoization, render efficiency).
// 5. Identify missing error handling and recommend robust solutions.
// 6. Highlight any potential security vulnerabilities (e.g., XSS, injection attacks).
// 7. Do not include header section into your code.
// 8. Always provide compact code with minimum formatting.
// HEADER-END

// ./src/helper/utils.ts
'use client';
// ./src/helper/utils.ts
// Utility function to convert hex to RGB
export const hexToRgb = (hex: string): {r: number; g: number; b: number} => {
   let cleanHex = hex.replace(/^#/, '');

   if (cleanHex.length === 3) {
      cleanHex = cleanHex
         .split('')
         .map(hexChar => hexChar + hexChar)
         .join('');
   }

   const bigint = parseInt(cleanHex, 16);
   return {
      r: (bigint >> 16) & 255,
      g: (bigint >> 8) & 255,
      b: bigint & 255,
   };
};

// Utility function to convert RGB back to hex
export const rgbToHex = (r: number, g: number, b: number): string => {
   return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
};

// Function to lighten a color by a percentage
export const lightenColor = (hex: string, percentage: number): string => {
   const {r, g, b} = hexToRgb(hex);

   const lighten = (value: number) => Math.round(value + (255 - value) * (percentage / 100));

   const newR = lighten(r);
   const newG = lighten(g);
   const newB = lighten(b);

   return rgbToHex(newR, newG, newB);
};
