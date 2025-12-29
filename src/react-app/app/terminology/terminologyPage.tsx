// HEADER-START
// * Path: ./src/app/terminology/terminologyPage.tsx
// HEADER-END

import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import {
  Box,
  Card,
  Container,
  InputAdornment,
  List,
  ListItem as MUIListItem,
  Paper,
  Stack,
  TextField,
  Typography,
  useTheme,
  IconButton,
  Chip,
  Fade,
  Collapse,
  Zoom,
  CircularProgress,
  alpha,
  Badge,
} from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Languages, useLanguage } from '@/components/context/LanguageContext';
import { getLocalStorageItem, setLocalStorageItem } from '@/components/utils/localStorageUtils';
import categories from '@/data/dictionary/categories.json';
import dictionaryEntities from '@/data/dictionary/dictionaryEntries.json';
import { DictionaryEntry } from '@/data/dictionary/DictionaryEntry';
import { useAuth } from '@/components/context/AuthContext';
import { useSnackbar } from '@/components/context/SnackbarContext';

// Define a type alias for FlattenedEntry
type FlattenedEntry =
  | {
      type: 'header';
      category: string;
      description?: string;
    }
  | { type: 'entry'; entry: DictionaryEntry };

// Enhanced HeaderItem component with modern styling
const HeaderItem = React.memo(
  ({ category, description }: { category: string; description?: string }) => {
    const theme = useTheme();
    return (
      <Fade in timeout={300}>
        <Box
          sx={{
            p: theme.spacing(2.5),
            mb: theme.spacing(1),
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
            borderLeft: `4px solid ${theme.palette.primary.main}`,
            borderRadius: 1,
            position: 'sticky',
            top: 0,
            zIndex: 10,
            backdropFilter: 'blur(10px)',
            boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.05)}`,
          }}
        >
          <Typography variant="h6" fontWeight={600} color="primary.main">
            {category}
          </Typography>
          {description && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {description}
            </Typography>
          )}
        </Box>
      </Fade>
    );
  },
);

// Enhanced EntryItem component with hover effects and animations
const EntryItem = React.memo(
  ({
    entry,
    toggleBookmark,
    bookmarkedWordIds,
    selectedLanguages,
  }: {
    entry: DictionaryEntry;
    toggleBookmark: (id: string) => void;
    bookmarkedWordIds: string[];
    selectedLanguages: (keyof DictionaryEntry)[];
  }) => {
    const theme = useTheme();
    const [isHovered, setIsHovered] = useState(false);
    const isBookmarked = bookmarkedWordIds.includes(entry.id);

    return (
      <Zoom in timeout={200}>
        <MUIListItem sx={{ p: theme.spacing(0.5) }}>
          <Card
            variant="outlined"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            sx={{
              p: theme.spacing(2.5),
              backgroundColor: theme.palette.background.paper,
              width: '100%',
              position: 'relative',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
              boxShadow: isHovered
                ? `0 8px 24px ${alpha(theme.palette.primary.main, 0.15)}`
                : `0 2px 8px ${alpha(theme.palette.common.black, 0.05)}`,
              borderColor: isHovered ? alpha(theme.palette.primary.main, 0.3) : 'divider',
              '&:hover': {
                borderColor: theme.palette.primary.main,
              },
            }}
          >
            <Stack spacing={1}>
              {selectedLanguages.map((lang) => {
                const language = Languages.find((l) => l.value === lang);
                if (!language) return null;

                const translation = entry[lang];
                if (!translation) return null;

                return (
                  <Box key={lang} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>
                      {language.icon}
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {translation}
                    </Typography>
                  </Box>
                );
              })}
            </Stack>
            <IconButton
              onClick={() => toggleBookmark(entry.id)}
              sx={{
                position: 'absolute',
                top: theme.spacing(1),
                right: theme.spacing(1),
                transition: 'all 0.2s ease',
                transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                },
              }}
            >
              {isBookmarked ? (
                <BookmarkIcon color="primary" sx={{ fontSize: 28 }} />
              ) : (
                <BookmarkBorderIcon sx={{ fontSize: 28 }} />
              )}
            </IconButton>
          </Card>
        </MUIListItem>
      </Zoom>
    );
  },
);

const TerminologyPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [bookmarksExpanded, setBookmarksExpanded] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const theme = useTheme();
  const { selectedLanguages } = useLanguage();
  const [bookmarkedWordIds, setBookmarkedWordIds] = useState<string[]>([]);

  const { token } = useAuth();
  const { showSnackbar } = useSnackbar();

  // Scroll to top handler
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Retrieve bookmarks from API
  useEffect(() => {
    setIsLoading(true);
    if (!token) {
      const bookmarks = getLocalStorageItem<string[]>('bookmarkedWords', []);
      setBookmarkedWordIds(bookmarks);
      setIsLoading(false);
      return;
    }

    fetch('/api/v1/terminology-progress', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Failed to fetch bookmarks');
      })
      .then((data: { bookmarks: string[] }) => {
        if (data.bookmarks) {
          setBookmarkedWordIds(data.bookmarks);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching bookmarks:', err);
        setIsLoading(false);
      });
  }, [token]);

  // Callback for toggling bookmark
  const toggleBookmark = useCallback(
    async (wordId: string) => {
      const originalBookmarkedIds = bookmarkedWordIds;
      const wasBookmarked = originalBookmarkedIds.includes(wordId);
      const newStatus = !wasBookmarked;

      // Optimistic update
      setBookmarkedWordIds((prev) => {
        return wasBookmarked ? prev.filter((id) => id !== wordId) : [...prev, wordId];
      });

      if (!token) {
        setBookmarkedWordIds((prev) => {
          setLocalStorageItem('bookmarkedWords', prev);
          return prev;
        });
        return;
      }

      try {
        const res = await fetch('/api/v1/terminology-progress', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ termId: wordId, isBookmarked: newStatus }),
        });

        if (!res.ok) {
          if (res.status === 401) {
            setBookmarkedWordIds(originalBookmarkedIds);
            showSnackbar('Session expired. Please log in again.', 'warning');
            return;
          }
          throw new Error('Failed to save bookmark');
        }
      } catch (error) {
        console.error('Save failed:', error);
        showSnackbar('Failed to save bookmark', 'error');
        setBookmarkedWordIds(originalBookmarkedIds);
      }
    },
    [bookmarkedWordIds, showSnackbar, token],
  );

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
  const filteredEntries = useMemo(() => {
    const normalizedSearch = removeDiacritics(debouncedSearchTerm).toLowerCase();
    return dictionaryEntities.dictionary.filter(
      (entry) =>
        removeDiacritics(entry.japanese).toLowerCase().includes(normalizedSearch) ||
        removeDiacritics(entry.romaji).toLowerCase().includes(normalizedSearch) ||
        removeDiacritics(entry.english).toLowerCase().includes(normalizedSearch),
    );
  }, [debouncedSearchTerm]);

  // Filter for bookmarked entries
  const bookmarkedEntries = useMemo(() => {
    return dictionaryEntities.dictionary.filter((entry) => bookmarkedWordIds.includes(entry.id));
  }, [bookmarkedWordIds]);

  // Create a flattened list with group headers
  const flattenedEntries = useMemo<FlattenedEntry[]>(() => {
    const items: FlattenedEntry[] = [];
    const categoryMap: Record<string, DictionaryEntry[]> = {};

    filteredEntries.forEach((entry) => {
      const category = categories.categories.find((cat) => cat.id === entry.categoryId);
      const categoryName = category?.name || entry.categoryId;
      const categoryDescription = category?.description;

      if (!categoryMap[categoryName]) {
        categoryMap[categoryName] = [];
        items.push({
          type: 'header',
          category: categoryName,
          description: categoryDescription,
        });
      }

      categoryMap[categoryName].push(entry);
      items.push({ type: 'entry', entry });
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

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  return (
    <Container maxWidth="lg" sx={{ pb: 4 }}>
      {/* Sticky Search Header */}
      <Paper
        elevation={3}
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          width: '100%',
          m: 0,
          p: theme.spacing(3),
          backgroundColor: alpha(theme.palette.background.paper, 0.95),
          backdropFilter: 'blur(10px)',
          borderRadius: 0,
          boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.1)}`,
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 700,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2,
          }}
        >
          Kyokushin Dictionary
        </Typography>

        {/* Search Field */}
        <TextField
          sx={{
            backgroundColor: theme.palette.background.default,
            borderRadius: 2,
            '& .MuiOutlinedInput-root': {
              '&:hover fieldset': {
                borderColor: theme.palette.primary.main,
              },
              '&.Mui-focused fieldset': {
                borderWidth: 2,
              },
            },
          }}
          fullWidth
          label="Search"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by Japanese, Romaji, Swedish or English"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="primary" />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton onClick={handleClearSearch} edge="end" size="small">
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {/* Active Filter Chips */}
        {(searchTerm || bookmarkedWordIds.length > 0) && (
          <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {searchTerm && (
              <Chip
                label={`Searching: "${searchTerm}"`}
                onDelete={handleClearSearch}
                color="primary"
                variant="outlined"
                size="small"
              />
            )}
            {bookmarkedWordIds.length > 0 && (
              <Chip
                icon={<BookmarkIcon />}
                label={`${bookmarkedWordIds.length} Bookmarked`}
                color="secondary"
                variant="outlined"
                size="small"
              />
            )}
            <Chip
              label={`${filteredEntries.length} Results`}
              color="default"
              variant="filled"
              size="small"
            />
          </Box>
        )}
      </Paper>

      {/* Main Content */}
      <Box sx={{ mt: 3 }}>
        {isLoading ? (
          <Box
            sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Bookmarked Items Section - Collapsible */}
            {bookmarkedEntries.length > 0 && (
              <Paper
                elevation={2}
                sx={{
                  mb: 3,
                  overflow: 'hidden',
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                }}
              >
                <Box
                  onClick={() => setBookmarksExpanded(!bookmarksExpanded)}
                  sx={{
                    p: theme.spacing(2),
                    backgroundColor: alpha(theme.palette.primary.main, 0.05),
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'background-color 0.2s',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BookmarkIcon color="primary" />
                    <Typography variant="h6" component="h2" color="primary.main" fontWeight={600}>
                      Bookmarked Items
                    </Typography>
                    <Badge badgeContent={bookmarkedEntries.length} color="primary" />
                  </Box>
                  <IconButton size="small">
                    {bookmarksExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                </Box>
                <Collapse in={bookmarksExpanded}>
                  <Box sx={{ p: theme.spacing(2) }}>
                    <List>
                      {bookmarkedEntries.map((entry) => (
                        <EntryItem
                          key={entry.id}
                          entry={entry}
                          toggleBookmark={handleToggleBookmark}
                          bookmarkedWordIds={bookmarkedWordIds}
                          selectedLanguages={selectedLanguages}
                        />
                      ))}
                    </List>
                  </Box>
                </Collapse>
              </Paper>
            )}

            {/* Complete List of Entries with Group Headers */}
            <Paper
              elevation={2}
              sx={{
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  p: theme.spacing(2),
                  backgroundColor: alpha(theme.palette.secondary.main, 0.05),
                }}
              >
                <Typography variant="h6" component="h2" color="secondary.main" fontWeight={600}>
                  All Entries
                </Typography>
              </Box>
              <Box sx={{ p: theme.spacing(2) }}>
                {flattenedEntries.length > 0 ? (
                  <List>
                    {flattenedEntries.map((item, index) => {
                      if (item.type === 'header') {
                        return (
                          <HeaderItem
                            key={`header-${item.category}-${index}`}
                            category={item.category}
                            description={item.description}
                          />
                        );
                      }
                      return (
                        <EntryItem
                          key={item.entry.id}
                          entry={item.entry}
                          toggleBookmark={handleToggleBookmark}
                          bookmarkedWordIds={bookmarkedWordIds}
                          selectedLanguages={selectedLanguages}
                        />
                      );
                    })}
                  </List>
                ) : (
                  <Box
                    sx={{
                      textAlign: 'center',
                      py: 8,
                    }}
                  >
                    <SearchIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No matching entries found
                    </Typography>
                    <Typography variant="body2" color="text.disabled">
                      Try adjusting your search terms
                    </Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </>
        )}
      </Box>

      {/* Scroll to Top Button */}
      <Zoom in={showScrollTop}>
        <IconButton
          onClick={scrollToTop}
          sx={{
            position: 'fixed',
            bottom: theme.spacing(4),
            right: theme.spacing(4),
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
            '&:hover': {
              backgroundColor: theme.palette.primary.dark,
              transform: 'scale(1.1)',
            },
            transition: 'all 0.3s ease',
            zIndex: 1000,
          }}
        >
          <KeyboardArrowUpIcon />
        </IconButton>
      </Zoom>
    </Container>
  );
};

export default TerminologyPage;
