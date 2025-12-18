// HEADER-START
// * Path: ./src/app/terminology/terminologyPage.tsx
// HEADER-END

import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import SearchIcon from '@mui/icons-material/Search';
import {Box, Card, Container, Divider, InputAdornment, List, ListItem as MUIListItem, Paper, Stack, TextField, Typography, useTheme} from '@mui/material';
import React, {useCallback, useEffect, useMemo, useState} from 'react';

import {Languages, useLanguage} from '@/components/context/LanguageContext';
import {getLocalStorageItem, setLocalStorageItem} from '@/components/utils/localStorageUtils'; // Import generic methods
import categories from '@/data/dictionary/categories.json';
import dictionaryEntities from '@/data/dictionary/dictionaryEntries.json';
import {DictionaryEntry} from '@/data/dictionary/DictionaryEntry';
import { useAuth } from '@/components/context/AuthContext';
import { useSnackbar } from '@/components/context/SnackbarContext';

// Define a type alias for FlattenedEntry
type FlattenedEntry =
   | {
        type: 'header';
        category: string;
        description?: string;
     }
   | {type: 'entry'; entry: DictionaryEntry};

// Separate HeaderItem component
const HeaderItem = React.memo(({category, description}: {category: string; description?: string}) => {
   const theme = useTheme();
   return (
      <Box
         sx={{
            p: theme.spacing(2),
            backgroundColor: theme.palette.background.paper,
         }}>
         <Typography variant='h6'>{category}</Typography>
         {description && (
            <Typography variant='body2' color='text.secondary'>
               {description}
            </Typography>
         )}
      </Box>
   );
});

// Separate EntryItem component
const EntryItem = React.memo(({entry, toggleBookmark, bookmarkedWordIds, selectedLanguages}: {entry: DictionaryEntry; toggleBookmark: (id: string) => void; bookmarkedWordIds: string[]; selectedLanguages: (keyof DictionaryEntry)[]}) => {
   const theme = useTheme();
   return (
      <MUIListItem key={entry.id} sx={{p: theme.spacing(0.5)}}>
         <Card
            variant='outlined'
            sx={{
               p: theme.spacing(2),
               backgroundColor: theme.palette.background.paper,
               width: '100%',
               position: 'relative',
            }}>
            <Stack spacing={0}>
               {selectedLanguages.map(lang => {
                  // Find the corresponding language object
                  const language = Languages.find(l => l.value === lang);
                  if (!language) return null;

                  // Retrieve the translation
                  const translation = entry[lang];
                  if (!translation) return null;

                  return (
                     <Box key={lang} sx={{display: 'flex', alignItems: 'center'}}>
                        <Typography variant='body1' sx={{mr: 1}}>
                           {language.icon}
                        </Typography>
                        <Typography variant='body1'>{translation}</Typography>
                     </Box>
                  );
               })}
            </Stack>
            <Box
               onClick={() => toggleBookmark(entry.id)}
               sx={{
                  position: 'absolute',
                  top: theme.spacing(1),
                  right: theme.spacing(1),
                  cursor: 'pointer',
               }}>
               {bookmarkedWordIds.includes(entry.id) ? <BookmarkIcon color='primary' /> : <BookmarkBorderIcon />}
            </Box>
         </Card>
      </MUIListItem>
   );
});

const TerminologyPage: React.FC = () => {
   const [searchTerm, setSearchTerm] = useState<string>('');
   const theme = useTheme();
   const {selectedLanguages} = useLanguage();
   const [bookmarkedWordIds, setBookmarkedWordIds] = useState<string[]>([]);
   
   const { token } = useAuth();
   const { showSnackbar } = useSnackbar();

   // Retrieve bookmarks from API
   useEffect(() => {
      if (!token) {
         // Fallback to local storage if not logged in (optional, or just clear)
         const bookmarks = getLocalStorageItem<string[]>('bookmarkedWords', []);
         setBookmarkedWordIds(bookmarks);
         return;
      }

      fetch('/api/v1/terminology-progress', {
         headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
         if (res.ok) return res.json();
         throw new Error('Failed to fetch bookmarks');
      })
      .then((data: {bookmarks: string[]}) => {
         if (data.bookmarks) {
            setBookmarkedWordIds(data.bookmarks);
         }
      })
      .catch(err => console.error('Error fetching bookmarks:', err));
   }, [token]);

   // Callback for toggling bookmark
   const toggleBookmark = useCallback(
      async (wordId: string) => {
         // Optimistic update
         setBookmarkedWordIds(prev => {
            const isBookmarked = prev.includes(wordId);
            return isBookmarked ? prev.filter(id => id !== wordId) : [...prev, wordId];
         });

         if (!token) {
             // Fallback to local storage
             setBookmarkedWordIds(prev => {
                setLocalStorageItem('bookmarkedWords', prev);
                return prev;
             });
             return;
         }

         try {
             // Calculate new state based on current optimistic state check
             // Note: ideally we pass the intended state. 
             // Since we just toggled, we can check if it WAS in the list before toggle (logic slightly complex with async).
             // Better: explicitly determine intent.
             const isBookmarked = bookmarkedWordIds.includes(wordId);
             const newStatus = !isBookmarked; // Toggle

             const res = await fetch('/api/v1/terminology-progress', {
                method: 'POST',
                headers: { 
                   'Content-Type': 'application/json',
                   Authorization: `Bearer ${token}` 
                },
                body: JSON.stringify({ termId: wordId, isBookmarked: newStatus })
             });

             if (!res.ok) throw new Error('Failed to save bookmark');

         } catch (error) {
             console.error('Save failed:', error);
             showSnackbar('Failed to save bookmark', 'error');
             // Revert on error
             setBookmarkedWordIds(prev => {
                 const isBookmarked = prev.includes(wordId);
                 return isBookmarked ? prev.filter(id => id !== wordId) : [...prev, wordId];
             });
         }
      },
      [bookmarkedWordIds, showSnackbar, token],
   );

   // ... (rest of component: debouncing, filtering, rendering)

   // Debounced search state
   const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>(searchTerm);

   // Debounce effect
   useEffect(() => {
      const handler = setTimeout(() => {
         setDebouncedSearchTerm(searchTerm);
      }, 300);
      return () => {
         clearTimeout(handler);
      };
   }, [searchTerm]);

   // Helper function to remove diacritics
   function removeDiacritics(str: string) {
      return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
   }

   // Filter entries by debounced search term
   // Note: This uses removeDiacritics to ensure consistent filtering
   const filteredEntries = useMemo(() => {
      const normalizedSearch = removeDiacritics(debouncedSearchTerm).toLowerCase();
      return dictionaryEntities.dictionary.filter(entry => removeDiacritics(entry.japanese).toLowerCase().includes(normalizedSearch) || removeDiacritics(entry.romaji).toLowerCase().includes(normalizedSearch) || removeDiacritics(entry.english).toLowerCase().includes(normalizedSearch));
   }, [debouncedSearchTerm]);

   // Filter for bookmarked entries
   const bookmarkedEntries = useMemo(() => {
      return dictionaryEntities.dictionary.filter(entry => bookmarkedWordIds.includes(entry.id));
   }, [bookmarkedWordIds]);

   // Create a flattened list with group headers
   const flattenedEntries = useMemo<FlattenedEntry[]>(() => {
      const items: FlattenedEntry[] = [];
      const categoryMap: Record<string, DictionaryEntry[]> = {};

      // Loop through filteredEntries to build the flattened structure
      filteredEntries.forEach(entry => {
         // Find the matching category
         const category = categories.categories.find(cat => cat.id === entry.categoryId);
         const categoryName = category?.name || entry.categoryId;
         const categoryDescription = category?.description;

         if (!categoryMap[categoryName]) {
            // Insert a header item for each new category
            categoryMap[categoryName] = [];
            items.push({
               type: 'header',
               category: categoryName,
               description: categoryDescription,
            });
         }

         // Push the entry item
         categoryMap[categoryName].push(entry);
         items.push({type: 'entry', entry});
      });

      return items;
   }, [filteredEntries]);

   // Stable reference for toggling bookmark
   const handleToggleBookmark = useCallback(
      (wordId: string) => {
         toggleBookmark(wordId);
      },
      [toggleBookmark],
   );

   return (
      <Container>
         <Paper
            elevation={3}
            sx={{
               width: '100%',
               m: 0,
               p: theme.spacing(4),
               backgroundColor: theme.palette.background.paper,
            }}>
            <Typography variant='h4' component='h1' gutterBottom>
               Kyokushin Dictionary
            </Typography>

            {/* Search Field */}
            <Box sx={{mb: theme.spacing(0), mt: theme.spacing(2)}}>
               <TextField
                  sx={{
                     backgroundColor: theme.palette.background.default,
                     borderRadius: 1,
                  }}
                  fullWidth
                  label='Search'
                  variant='outlined'
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder='Search by Japanese, Romaji, Swedish or English'
                  InputProps={{
                     startAdornment: (
                        <InputAdornment position='start'>
                           <SearchIcon />
                        </InputAdornment>
                     ),
                  }}
               />
            </Box>
         </Paper>

         <Box sx={{p: theme.spacing(4), backgroundColor: theme.palette.background.paper}}>
            {/* Bookmarked Items Section */}
            <Box sx={{mb: theme.spacing(4)}}>
               <Typography variant='h5' component='h2' gutterBottom color={theme.palette.primary.main}>
                  Bookmarked Items
               </Typography>
               <Divider sx={{mb: theme.spacing(2)}} />
               {bookmarkedEntries.length > 0 ? (
                  <List>
                     {bookmarkedEntries.map(entry => (
                        <EntryItem key={entry.id} entry={entry} toggleBookmark={handleToggleBookmark} bookmarkedWordIds={bookmarkedWordIds} selectedLanguages={selectedLanguages} />
                     ))}
                  </List>
               ) : (
                  <Typography variant='body1' color='text.secondary'>
                     No bookmarked items.
                  </Typography>
               )}
            </Box>

            {/* Complete List of Entries with Group Headers */}
            <Box>
               <Typography variant='h5' component='h2' gutterBottom color={theme.palette.primary.main}>
                  All Entries
               </Typography>
               <Divider sx={{mb: theme.spacing(2)}} />
               {flattenedEntries.length > 0 ? (
                  <List>
                     {flattenedEntries.map((item, index) => {
                        if (item.type === 'header') {
                           return <HeaderItem key={`header-${item.category}-${index}`} category={item.category} description={item.description} />;
                        }
                        return <EntryItem key={item.entry.id} entry={item.entry} toggleBookmark={handleToggleBookmark} bookmarkedWordIds={bookmarkedWordIds} selectedLanguages={selectedLanguages} />;
                     })}
                  </List>
               ) : (
                  <Typography variant='body1' color='text.secondary'>
                     No matching entries found.
                  </Typography>
               )}
            </Box>
         </Box>
      </Container>
   );
};

export default TerminologyPage;