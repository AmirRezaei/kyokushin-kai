// HEADER-START
// * Path: ./src/PersistentTextField.tsx
// HEADER-END

// ./src/PersistentTextField.tsx
'use client';
// ./src/PersistentTextField.tsx
import TextField from '@mui/material/TextField';
import React, {ChangeEvent, useEffect, useState} from 'react';

interface PersistentTextFieldProps {
   name: string;
   helperText: string;
}

const PersistentTextField: React.FC<PersistentTextFieldProps> = ({name, helperText}) => {
   const [textValue, setTextValue] = useState<string>('');

   useEffect(() => {
      // Load the text from localStorage when the component mounts
      const savedText = localStorage.getItem(name);
      if (savedText) {
         setTextValue(savedText);
      } else {
         setTextValue('');
      }
   }, [name, helperText]);

   const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value;
      setTextValue(newValue);
      // Save the text to localStorage
      localStorage.setItem(name, newValue);
   };

   return (
      <TextField
         id='filled-helperText'
         label='Anteckningar'
         helperText={helperText}
         variant='outlined'
         multiline
         rows={5}
         style={{
            width: '100%',
         }}
         value={textValue}
         onChange={handleChange}
      />
   );
};

export default PersistentTextField;
