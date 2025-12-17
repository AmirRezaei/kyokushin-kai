// HEADER-START
// * Project: Kyokushin
// * Path: src/components/helper/HelperColor.ts
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

// ./src/components/helper/HelperColor.ts
'use client';
// ./src/components/helper/HelperColor.ts
/**
 * Converts a hex color code to RGB values.
 * @param hex - The hex color code (e.g., '#ff5733', '#abcdef')
 * @returns An object containing the RGB values (e.g., { r: 255, g: 87, b: 51 })
 */
export const hexToRgb = (hex: string): {r: number; g: number; b: number} => {
   // Remove the '#' if present
   hex = hex.replace('#', '');

   // Parse the hex into RGB components
   let r: number, g: number, b: number;
   if (hex.length === 6) {
      r = parseInt(hex.slice(0, 2), 16);
      g = parseInt(hex.slice(2, 4), 16);
      b = parseInt(hex.slice(4, 6), 16);
   } else if (hex.length === 3) {
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
   } else {
      throw new Error('Invalid hex color format');
   }
   return {r, g, b};
};

/**
 * Calculates the luminance of an RGB color.
 * @param r - The red component (0-255)
 * @param g - The green component (0-255)
 * @param b - The blue component (0-255)
 * @returns A number representing the luminance (0 to 1)
 */
export const calculateLuminance = (r: number, g: number, b: number): number => {
   // Normalize the RGB values to the [0, 1] range
   const [red, green, blue] = [r, g, b].map(c => c / 255);

   // Apply the luminance formula (per WCAG 2.0 standard)
   const [R, G, B] = [red, green, blue].map(c => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));

   return 0.2126 * R + 0.7152 * G + 0.0722 * B;
};

/**
 * Determines if a color is light or dark based on its hex value.
 * @param hex - The hex color code (e.g., '#ff5733')
 * @returns 'light' if the color is light, 'dark' if the color is dark
 */
export const getBrightness = (hex: string): 'light' | 'dark' => {
   // Convert hex to RGB
   const {r, g, b} = hexToRgb(hex);

   // Calculate the luminance of the color
   const lum = calculateLuminance(r, g, b);

   // Return 'light' if luminance > 0.5, otherwise return 'dark'
   return lum > 0.5 ? 'light' : 'dark';
};

// Convert the adjusted RGB back to hex format
export const rgbToHex = (r: number, g: number, b: number): string => {
   return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
};

/**
 * Adjusts the lightness of a color based on its brightness.
 * @param hex - The hex color code (e.g., '#ff5733')
 * @param adjustment - 'lighter' or 'darker' to adjust the color
 * @returns A new hex color code that is lighter or darker
 */
export const adjustColorLightness = (hex: string): string => {
   const adjustment = getBrightness(hex);

   // Convert hex to RGB
   const {r, g, b} = hexToRgb(hex);

   // Calculate the amount to lighten or darken the color
   const adjust = (value: number, factor: number): number => {
      return Math.min(255, Math.max(0, value + factor));
   };

   let factor: number;

   // Darken if the original color is light, lighten if it's dark
   if (adjustment === 'dark') {
      factor = -20; // Decrease the RGB values to darken the color
   } else {
      factor = 20; // Increase the RGB values to lighten the color
   }

   // Adjust each RGB component
   const newR = adjust(r, factor);
   const newG = adjust(g, factor);
   const newB = adjust(b, factor);

   // Return the new hex color
   return rgbToHex(newR, newG, newB);
};

export const adjustedColor = (hex: string): string => {
   const adjustment = getBrightness(hex);

   // Darken if the original color is light, lighten if it's dark
   if (adjustment === 'dark') {
      return '#FFFFFF';
   } else {
      return '#000000';
   }
};

export const colorMap: {[key: string]: string} = {
   white: '#FFFFFF',
   orange: '#FFA500',
   blue: '#0000FF',
   yellow: '#FFD700',
   green: '#008000',
   brown: '#A52A2A',
   black: '#000000',
};

export const getHexColor = (colorName: string): string => {
   return colorMap[colorName.toLowerCase()] || colorName;
};
