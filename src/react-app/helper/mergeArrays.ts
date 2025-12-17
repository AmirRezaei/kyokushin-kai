// HEADER-START
// * Project: Kyokushin
// * Path: src/helper/mergeArrays.ts
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

// ./src/helper/mergeArrays.ts
'use client';
// ./src/helper/mergeArrays.ts
// Define the generic types
type Merge<T, U> = T & U;

// Generic function to merge two arrays of objects
export function mergeArrays<T, U>(arr1: T[], arr2: U[]): Array<Merge<T, U>> {
   // Check if the arrays are of the same length
   if (arr1.length !== arr2.length) {
      throw new Error('The arrays must be of the same length');
   }

   return arr1.map((item, index) => {
      return {
         ...item,
         ...arr2[index],
      };
   });
}
