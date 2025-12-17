// HEADER-START
// * Project: Kyokushin
// * Path: src/components/StrikeIcon.tsx
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

// ./src/components/StrikeIcon.tsx
import SvgIcon, {SvgIconProps} from '@mui/material/SvgIcon';
import * as React from 'react';

const StrikeIcon: React.FC<SvgIconProps> = props => (
   <SvgIcon viewBox='0 0 512 512' {...props}>
      <path d='M177.6 1.6c-24.7 6-41.5 30.7-37.9 55.9 5.9 41.2 56 58 85.4 28.6 19.8-19.8 19.9-50.7.3-70.8C213 2.6 194.9-2.6 177.6 1.6' />
      <path d='M123 98.7c-6.4 3.2-17.1 13.4-22.7 21.8-13.3 19.7-23.5 50.2-28 83.3-1.3 9.7-1.4 13-.5 16.1 3.1 10.3 14.1 15.7 23.7 11.7 1.9-.8 11.7-7.7 21.8-15.4 10-7.6 32.1-24.3 49.1-37.2s31.7-24.8 32.7-26.5c8.7-14.2-5.2-31.9-20.8-26.5-1.7.6-17.8 12.3-35.9 26-31.4 23.8-32.9 24.8-34.2 22.9-.8-1.2-1-2.4-.6-2.9 1.8-1.6 61-46.4 64.6-48.7 4.5-3 13.8-4.1 19.3-2.3 5 1.6 11.4 7.5 13.6 12.5 3.9 8.5 1.7 19.7-5.2 26.1-1.9 1.7-22.3 17.4-45.4 34.9-23.1 17.4-42.1 31.8-42.2 31.9 0 0-.8 9.8-1.7 21.6l-1.5 21.5 7.7 52.3 7.6 52.2-37.6 37.8c-44.5 44.7-41.2 39.4-40.6 64.5.4 18.2.9 19.9 8.1 27.5 10.8 11.1 28.6 10.7 39.1-.9 5.4-6 7.6-12.1 7.6-20.8v-6.6l37.4-37.5c40.5-40.5 42.6-43.1 42.6-53 0-2.5-2.9-24.5-6.5-48.9-3.7-24.5-6.5-45.3-6.3-46.4.2-1.5 9 7.3 34.8 34.9 18.9 20.3 36.8 39.4 39.8 42.5l5.3 5.7 5.5 56.3c3 31 6.1 58.7 6.9 61.5 1.9 6.8 7.9 13.5 14.7 16.4 15.1 6.6 32.6-1.3 37.5-16.8 1.7-5.3 1.6-6.2-3.6-60-7.5-77.3-7.5-77.5-10.5-82.5-1.4-2.3-17.1-21.5-35-42.7l-32.5-38.4.5-4.6c.4-4.1 8.4-126.7 8.4-129 0-.7 33.4-1 98.5-1 88.8 0 98.9.2 101.7 1.6 4.8 2.5 11.9 2.1 17.2-1 11.5-6.7 11.3-22.9-.6-31.2-8-5.6-3.9-5.4-123.7-5.4H222.4l-6.5 3.5c-16.6 8.8-36.4 8.8-52.7-.1l-6.3-3.4h-14.2c-13.5 0-14.6.1-19.7 2.7' />
   </SvgIcon>
);

export default StrikeIcon;
