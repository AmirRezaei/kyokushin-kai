// HEADER-START
// * Path: ./src/components/ImportExportLocalStorage.tsx
// HEADER-END

import React from 'react';

// Function to handle importing data into localStorage
export const importLocalStorageDataFromJSON = (file: File) => {
   const reader = new FileReader();

   reader.onload = event => {
      try {
         const result = event.target?.result;
         if (typeof result === 'string') {
            const data = JSON.parse(result) as Record<string, string>;

            for (const key in data) {
               if (Object.prototype.hasOwnProperty.call(data, key)) {
                  localStorage.setItem(key, data[key]);
               }
            }

            alert('Data successfully imported into localStorage!');
         }
      } catch (error) {
         alert('Error importing data: Invalid JSON file.');
      }
   };

   reader.readAsText(file);
};

// File input change handler
const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
   const file = event.target.files?.[0];
   if (file) {
      importLocalStorageDataFromJSON(file);
   }
};

// Function to export localStorage data
export const exportLocalStorageDataAsJSON = () => {
   const allData: Record<string, string | null> = {};

   for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
         allData[key] = localStorage.getItem(key);
      }
   }

   const jsonData = JSON.stringify(allData, null, 2);
   const blob = new Blob([jsonData], {
      type: 'application/json',
   });
   const url = URL.createObjectURL(blob);
   const a = document.createElement('a');
   a.href = url;
   a.download = 'localStorageData.json';
   a.click();
   URL.revokeObjectURL(url);
};
