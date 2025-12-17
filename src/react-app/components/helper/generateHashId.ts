// HEADER-START
// * Project: Kyokushin
// * Path: src/components/helper/generateHashId.ts
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

// ./src/components/helper/generateHashId.ts
'use client';
// ./src/components/helper/generateHashId.ts

/**
 * Generates a unique and consistent hash ID for an array of strings, regardless of the order of the strings.
 *
 * This function sorts the array of strings to ensure that reordering the input does not affect the hash output.
 * It uses the FNV-1a hash algorithm to produce a 32-bit hash value, which minimizes collision probability
 * and is robust for generating hash IDs in applications where uniqueness is required.
 *
 * @param strings - An array of strings to hash.
 * @param prefix - A string prefix for the ID (default is 'hash_').
 * @returns A consistent, padded hash ID as a string.
 */
function generateHashId(strings: string[], prefix: string = 'hash_'): string {
   // Step 1: Sort the array to ensure consistent hash regardless of input order
   const sortedStrings = [...strings].sort();

   // Step 2: Join sorted strings into a single string with a delimiter
   const combinedString = sortedStrings.join(',');

   // Step 3: FNV-1a Hash Calculation
   let hash = 0x811c9dc5; // FNV-1a 32-bit offset basis
   for (let i = 0; i < combinedString.length; i++) {
      hash ^= combinedString.charCodeAt(i);
      hash = (hash * 0x01000193) >>> 0; // Multiply by FNV prime and ensure 32-bit unsigned integer
   }

   // Step 4: Format hash with hexadecimal padding
   const hexHash = hash.toString(16).padStart(8, '0'); // Pads to ensure 8 characters

   // Return the formatted ID with the specified prefix
   return `${prefix}${hexHash}`;
}

export {generateHashId};
