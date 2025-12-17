// HEADER-START
// * Path: ./src/data/DataProvider.tsx
// HEADER-END

import React, {createContext, ReactNode, useContext} from 'react';

interface DataProviderProps {
   children: ReactNode;
}

interface DataContextType {
   getBookmarkById: (id: number) => boolean | false;
   setBookmarkById: (id: number, value: boolean) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<DataProviderProps> = ({children}) => {
   const getBookmarkById = (id: number): boolean => {
      return localStorage.getItem('bookmark' + id) === 'true';
   };

   const setBookmarkById = (id: number, value: boolean): void => {
      localStorage.setItem('bookmark' + id, value.toString());
   };

   return (
      <DataContext.Provider
         value={{
            getBookmarkById: getBookmarkById,
            setBookmarkById: setBookmarkById,
         }}>
         {children}
      </DataContext.Provider>
   );
};

export const useData = (): DataContextType => {
   const context = useContext(DataContext);
   if (context === undefined) {
      throw new Error('useData must be used within a DataProvider');
   }
   return context;
};
