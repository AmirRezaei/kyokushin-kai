// HEADER-START
// * Project: Kyokushin
// * Path: src/components/helper/helper.ts
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

// ./src/components/helper/helper.ts
'use client';
// ./src/components/helper/helper.ts
// Efficient array comparison
export function arraysAreEqual(arr1: string[], arr2: string[]): boolean {
   if (arr1.length !== arr2.length) return false;
   for (let i = 0; i < arr1.length; i++) {
      if (arr1[i] !== arr2[i]) return false;
   }
   return true;
}

// Fisher-Yates Shuffle Algorithm
export function shuffleArray(array: string[], maxAttempts = 10): string[] {
   if (array.length <= 1) return array;

   let shuffledArray = array.slice(); // Create a copy of the array to shuffle
   let attempts = 0;

   do {
      shuffledArray = fisherYatesShuffle(shuffledArray);
      attempts++;
      if (attempts >= maxAttempts) {
         console.warn('Maximum shuffle attempts reached. Returning current shuffled array.');
         break;
      }
   } while (arraysAreEqual(shuffledArray, array));

   return shuffledArray;
}

// Helper function: Fisher-Yates Shuffle for strings
export function fisherYatesShuffle(array: string[]): string[] {
   const shuffled = array.slice(); // Create a copy to avoid mutating the original
   for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
   }
   return shuffled;
}
