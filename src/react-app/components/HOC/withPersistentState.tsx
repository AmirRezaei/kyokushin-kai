// HEADER-START
// * Project: Kyokushin
// * Path: src/components/HOC/withPersistentState.tsx
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

// ./src/components/HOC/withPersistentState.tsx
'use client';
// ./src/components/HOC/withPersistentState.tsx
import React, {forwardRef, useEffect, useState} from 'react';

/**
 * Higher-Order Component (HOC) for adding persistent state to any component.
 *
 * @template T - The type of the state to persist (e.g., string, number, boolean, or complex object).
 *
 * @param WrappedComponent - The component to wrap and add persistence to.
 * @param key - The unique key used to store and retrieve the value in localStorage.
 * @param defaultValue - The initial default value if no value is found in localStorage.
 *
 * @returns A component wrapped with persistent state functionality.
 *
 * @example
 * // Simple usage with a dropdown component
 * const PersistentDropdown = withPersistentState(DropdownComponent, 'dropdownKey', '');
 *
 * <PersistentDropdown options={[{ value: '1', label: 'Option 1' }, { value: '2', label: 'Option 2' }]} />
 */
function withPersistentState<T>(WrappedComponent: React.ComponentType<any>, key: string, defaultValue: T) {
   return forwardRef((props: any, ref) => {
      // Initialize state from localStorage or use the provided defaultValue if not available
      const [value, setValue] = useState<T>(() => {
         const savedValue = localStorage.getItem(key);
         return savedValue !== null ? JSON.parse(savedValue) : defaultValue;
      });

      // Effect to update localStorage whenever `value` changes
      useEffect(() => {
         localStorage.setItem(key, JSON.stringify(value));
      }, [value]); // Remove `key` from the dependency array

      /**
       * Event handler to update the persistent state.
       *
       * @param event - The change event from the wrapped component, containing the new value.
       */
      const handleChange = (event: any) => {
         const newValue = event.target.value;
         setValue(newValue);
      };

      // Return the wrapped component with injected `value` and `onChange` props for persistence
      return (
         <WrappedComponent
            {...props}
            value={value}
            onChange={handleChange}
            ref={ref} // Forwarding ref if the inner component requires it
         />
      );
   });
}

export default withPersistentState;
