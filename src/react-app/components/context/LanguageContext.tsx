// HEADER-START
// * Path: ./src/components/context/LanguageContext.tsx
// HEADER-END

import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

import { getLocalStorageItem, setLocalStorageItem } from '@/components/utils/localStorageUtils';

// Define the Language enum
export enum LanguageEnum {
  Japanese = 'japanese',
  Romaji = 'romaji',
  English = 'english',
  Swedish = 'swedish',
  // Add more languages as needed
}

// Define the Language type based on the enum
export type Language =
  | LanguageEnum.Romaji
  | LanguageEnum.Japanese
  | LanguageEnum.English
  | LanguageEnum.Swedish;

// Define the available languages with labels and icons
export const Languages: { value: Language; label: string; icon: string }[] = [
  { value: LanguageEnum.Romaji, label: 'Romaji', icon: '🇯🇵' },
  { value: LanguageEnum.Japanese, label: 'Japanese', icon: '🇯🇵' },
  { value: LanguageEnum.English, label: 'English', icon: '🇬🇧' },
  { value: LanguageEnum.Swedish, label: 'Swedish', icon: '🇸🇪' },
  // Add more languages as needed
];

// Helper function to get the appropriate Unicode flag emoji
export const GetFlagEmoji = (type: Language): string => {
  switch (type) {
    case LanguageEnum.Romaji:
      return '🇯🇵'; // Japan
    case LanguageEnum.Japanese:
      return '🇯🇵'; // Japan
    case LanguageEnum.English:
      return '🇬🇧'; // United Kingdom
    case LanguageEnum.Swedish:
      return '🇸🇪'; // Sweden
    default:
      return '🏳️'; // White flag for unknown
  }
};

// Helper function to get LocalizedText property key from Language enum
// Maps LanguageEnum values ('english', 'swedish', etc.) to catalog.json keys ('en', 'sv', etc.)
export const getLocalizedTextKey = (language: Language): string => {
  switch (language) {
    case LanguageEnum.English:
      return 'en';
    case LanguageEnum.Swedish:
      return 'sv';
    case LanguageEnum.Japanese:
      return 'ja';
    case LanguageEnum.Romaji:
      return 'romaji';
    default:
      return 'en'; // Fallback to English
  }
};

// Define the shape of the context
interface LanguageContextProps {
  selectedLanguages: Language[];
  setSelectedLanguages: (languages: Language[]) => void;
  addLanguage: (language: Language) => void;
  removeLanguage: (language: Language) => void;
  toggleLanguage: (language: Language) => void;
  clearLanguages: () => void;
  isLanguageSelected: (language: Language) => boolean;
}

// Create the context with default values
const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

// Define the key for localStorage
const LOCAL_STORAGE_KEY = 'selectedLanguages';

// Mandatory languages that must always be selected
const MANDATORY_LANGUAGES: Language[] = [LanguageEnum.Romaji];

// Create a provider component
export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // const [selectedLanguages, setSelectedLanguagesState] = useState<Language[]>(() => {
  //    const storedLanguages = getLocalStorageItem<Language[]>(LOCAL_STORAGE_KEY, [LanguageEnum.English]);
  //    // Ensure mandatory languages are always included
  //    const languagesSet = new Set<Language>(storedLanguages);
  //    MANDATORY_LANGUAGES.forEach(lang => languagesSet.add(lang));
  //    return Array.from(languagesSet);
  // });
  const [selectedLanguages, setSelectedLanguagesState] = useState<Language[]>(() => {
    const storedLanguages = getLocalStorageItem<Language[]>(LOCAL_STORAGE_KEY, [
      LanguageEnum.English,
    ]);
    // Ensure mandatory languages are always included
    const languagesSet = new Set<Language>(storedLanguages);
    MANDATORY_LANGUAGES.forEach((lang) => languagesSet.add(lang));

    // Make mandatory languages appear first
    return Array.from(languagesSet).sort((a, b) => {
      if (MANDATORY_LANGUAGES.includes(a) && !MANDATORY_LANGUAGES.includes(b)) return -1;
      if (!MANDATORY_LANGUAGES.includes(a) && MANDATORY_LANGUAGES.includes(b)) return 1;
      return 0;
    });
  });

  // Update localStorage whenever selectedLanguages changes
  useEffect(() => {
    setLocalStorageItem<Language[]>(LOCAL_STORAGE_KEY, selectedLanguages);
  }, [selectedLanguages]);

  // Wrapper to update state
  const setSelectedLanguages = (languages: Language[]) => {
    // Ensure mandatory languages are always included
    const languagesSet = new Set<Language>(languages);
    MANDATORY_LANGUAGES.forEach((lang) => languagesSet.add(lang));
    setSelectedLanguagesState(Array.from(languagesSet));
  };

  // Add a language
  const addLanguage = (language: Language) => {
    setSelectedLanguagesState((prev) => {
      const updated = new Set<Language>(prev);
      updated.add(language);
      // Ensure mandatory languages are always included
      MANDATORY_LANGUAGES.forEach((lang) => updated.add(lang));
      return Array.from(updated);
    });
  };

  // Remove a language
  const removeLanguage = (language: Language) => {
    if (MANDATORY_LANGUAGES.includes(language)) {
      // Prevent removing mandatory languages
      return;
    }
    setSelectedLanguagesState((prev) => {
      const updated = prev.filter((lang) => lang !== language);
      // Ensure mandatory languages are always included
      MANDATORY_LANGUAGES.forEach((lang) => {
        if (!updated.includes(lang)) {
          updated.unshift(lang);
        }
      });
      return updated;
    });
  };

  // Toggle a language
  const toggleLanguage = (language: Language) => {
    if (isLanguageSelected(language)) {
      removeLanguage(language);
    } else {
      addLanguage(language);
    }
  };

  // Clear all languages except mandatory ones
  const clearLanguages = () => {
    setSelectedLanguagesState([...MANDATORY_LANGUAGES]);
  };

  // Check if a language is selected
  const isLanguageSelected = (language: Language) => selectedLanguages.includes(language);

  return (
    <LanguageContext.Provider
      value={{
        selectedLanguages,
        setSelectedLanguages,
        addLanguage,
        removeLanguage,
        toggleLanguage,
        clearLanguages,
        isLanguageSelected,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook for easy access to the context
export const useLanguage = (): LanguageContextProps => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
