// HEADER-START
// * Project: Kyokushin
// * Path: src/data/kyokushinRanks.tsx
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

// ./src/data/kyokushinRanks.tsx
'use client';
// ./src/data/kyokushinRanks.tsx
// KyokushinRank interface describes the structure of a rank, including its belt color, stripes, rank, and optional titles.
interface KyokushinRank {
   beltColor: string; // The main belt color (e.g., "Black", "Orange").
   beltColorHex: string; // Hex code for the belt color (for UI purposes).
   beltStripe: number; // Number of stripes on the belt (usually for advanced rankings).
   beltName: string; // Descriptive name of the belt (e.g., "Black with Two Stripes").
   beltRank: string; // General rank level (e.g., "Beginner", "Expert").
   title?: string; // Optional title associated with a rank (e.g., "Shodan").
   honoraryTitle?: string; // Optional honorary title for advanced ranks (e.g., "Sensei").
}

// Mapping of Kyokushin ranks to their respective belt colors, stripes, and titles.
// Each key is the rank name (e.g., "1st Dan", "10th Kyu"), and the value is an object of KyokushinRank.
const kyokushinRanks: {[key: string]: KyokushinRank} = {
   'Mukyu': {
      beltColor: 'White',
      beltColorHex: '#FFFFFF',
      beltStripe: 0,
      beltName: 'White',
      beltRank: 'Beginner',
   }, // Custom Beginner rank
   '10th Kyu': {
      beltColor: 'Orange',
      beltColorHex: '#FFA500',
      beltStripe: 0,
      beltName: 'Orange',
      beltRank: 'Intermediate',
   },
   '9th Kyu': {
      beltColor: 'Orange',
      beltColorHex: '#FFA500',
      beltStripe: 1,
      beltName: 'Orange with One Stripe',
      beltRank: 'Intermediate',
   },
   '8th Kyu': {
      beltColor: 'Blue',
      beltColorHex: '#0000FF',
      beltStripe: 0,
      beltName: 'Blue',
      beltRank: 'Intermediate',
   },
   '7th Kyu': {
      beltColor: 'Blue',
      beltColorHex: '#0000FF',
      beltStripe: 1,
      beltName: 'Blue with One Stripe',
      beltRank: 'Intermediate',
   },
   '6th Kyu': {
      beltColor: 'Yellow',
      beltColorHex: '#FFFF00',
      beltStripe: 0,
      beltName: 'Yellow',
      beltRank: 'Intermediate',
   }, // Custom color (yellow)
   '5th Kyu': {
      beltColor: 'Yellow',
      beltColorHex: '#FFFF00',
      beltStripe: 1,
      beltName: 'Yellow with One Stripe',
      beltRank: 'Advanced',
   }, // Custom color (yellow)
   '4th Kyu': {
      beltColor: 'Green',
      beltColorHex: '#008000',
      beltStripe: 0,
      beltName: 'Green',
      beltRank: 'Advanced',
   },
   '3rd Kyu': {
      beltColor: 'Green',
      beltColorHex: '#008000',
      beltStripe: 1,
      beltName: 'Green with One Stripe',
      beltRank: 'Advanced',
   },
   '2nd Kyu': {
      beltColor: 'Brown',
      beltColorHex: '#8B4513',
      beltStripe: 0,
      beltName: 'Brown',
      beltRank: 'Advanced',
   },
   '1st Kyu': {
      beltColor: 'Brown',
      beltColorHex: '#8B4513',
      beltStripe: 1,
      beltName: 'Brown with One Stripe',
      beltRank: 'Advanced',
   },

   // Dan belts with stripes (typically gold or white)
   '1st Dan': {
      beltColor: 'Black',
      beltColorHex: '#000000',
      beltStripe: 1,
      beltName: 'Black',
      beltRank: 'Expert',
      title: 'Shodan',
   },
   '2nd Dan': {
      beltColor: 'Black',
      beltColorHex: '#000000',
      beltStripe: 2,
      beltName: 'Black with One Stripe',
      beltRank: 'Expert',
      title: 'Nidan',
   },
   '3rd Dan': {
      beltColor: 'Black',
      beltColorHex: '#000000',
      beltStripe: 3,
      beltName: 'Black with Two Stripes',
      beltRank: 'Expert',
      title: 'Sandan',
   },
   '4th Dan': {
      beltColor: 'Black',
      beltColorHex: '#000000',
      beltStripe: 4,
      beltName: 'Black with Three Stripes',
      beltRank: 'Expert',
      title: 'Yondan',
      honoraryTitle: 'Sensei',
   },
   '5th Dan': {
      beltColor: 'Black',
      beltColorHex: '#000000',
      beltStripe: 5,
      beltName: 'Black with Four Stripes',
      beltRank: 'Expert',
      title: 'Godan',
      honoraryTitle: 'Sensei',
   },
   '6th Dan': {
      beltColor: 'Black',
      beltColorHex: '#000000',
      beltStripe: 6,
      beltName: 'Black with Five Stripes',
      beltRank: 'Master',
      title: 'Rokudan',
      honoraryTitle: 'Shihan',
   },
   '7th Dan': {
      beltColor: 'Black',
      beltColorHex: '#000000',
      beltStripe: 7,
      beltName: 'Black with Six Stripes',
      beltRank: 'Master',
      title: 'Nanadan',
      honoraryTitle: 'Shihan',
   },
   '8th Dan': {
      beltColor: 'Black',
      beltColorHex: '#000000',
      beltStripe: 8,
      beltName: 'Black with Seven Stripes',
      beltRank: 'Master',
      title: 'Hachidan',
      honoraryTitle: 'Kyoshi/Shihan',
   },
   '9th Dan': {
      beltColor: 'Black',
      beltColorHex: '#000000',
      beltStripe: 9,
      beltName: 'Black with Eight Stripes',
      beltRank: 'Grandmaster',
      title: 'Kudan',
      honoraryTitle: 'Hanshi',
   },
   '10th Dan': {
      beltColor: 'Black',
      beltColorHex: '#000000',
      beltStripe: 10,
      beltName: 'Black with Nine Stripes',
      beltRank: 'Grandmaster',
      title: 'Judan',
      honoraryTitle: 'Hanshi',
   },
};

export default kyokushinRanks;
