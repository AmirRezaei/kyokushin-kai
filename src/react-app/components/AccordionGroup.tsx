// HEADER-START
// * Project: Kyokushin
// * Path: src/components/AccordionGroup.tsx
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

// ./src/components/AccordionGroup.tsx
'use client';
// ./src/components/AccordionGroup.tsx
import Accordion from '@mui/material/Accordion';
import Button from '@mui/material/Button';
import React, {useState} from 'react';

interface AccordionGroupProps {
   children: React.ReactNode;
}

const AccordionGroup: React.FC<AccordionGroupProps> = ({children}) => {
   const [expandedAll, setExpandedAll] = useState<boolean>(false);
   const [expandedIndices, setExpandedIndices] = useState<number[]>([]);

   const handleToggleAll = () => {
      setExpandedAll(prevExpandedAll => !prevExpandedAll);
      if (!expandedAll) {
         // Expand all accordions by setting indices array to the total number of children
         setExpandedIndices(React.Children.map(children, (_, index) => index) || []);
      } else {
         // Collapse all accordions by clearing indices array
         setExpandedIndices([]);
      }
   };

   const handleAccordionChange = (index: number) => {
      setExpandedIndices(prevExpandedIndices => (prevExpandedIndices.includes(index) ? prevExpandedIndices.filter(i => i !== index) : [...prevExpandedIndices, index]));
   };

   return (
      <div>
         <Button variant='contained' onClick={handleToggleAll}>
            {expandedAll ? 'Collapse All' : 'Expand All'}
         </Button>
         {React.Children.map(children, (child, index) => {
            // Check if the child is an Accordion component
            if (React.isValidElement(child) && child.type === Accordion) {
               // Return the cloned element with the additional props
               return React.cloneElement(child as any, {
                  expanded: expandedIndices.includes(index),
                  onChange: () => handleAccordionChange(index),
               });
            }
            // If not an Accordion, return the child as is
            return child;
         })}
      </div>
   );
};

export default AccordionGroup;
