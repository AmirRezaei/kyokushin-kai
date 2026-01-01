// HEADER-START
// * Path: ./src/Quote/QuoteComponent.tsx
// HEADER-END
import {ArrowBackIos, ArrowForwardIos, Favorite, FavoriteBorder, Info as InfoIcon} from '@mui/icons-material';
import {Avatar, Box, BoxProps, Card, CardContent, Chip, Collapse, IconButton, Paper, Stack, Typography} from '@mui/material';
import React, {useEffect, useState} from 'react';

import CopyButton from '../components/UI/CopyButton';
import {getLocalStorageItemById, setLocalStorageItemById} from '../components/utils/localStorageUtils';
type QuoteRecord = {
   id: string;
   author: string;
   tags: string[];
   date?: string;
   text: string;
   meaning: string;
   history?: string;
   reference?: string;
   isFavorited?: boolean;
};

// Define the component props
interface QuoteProps extends BoxProps {
   quotes?: QuoteRecord[];
}

const FAVORITE_QUOTES_KEY = 'favoriteQuotes';

const normalizeQuote = (quote: QuoteRecord): QuoteRecord => ({
   ...quote,
   author: typeof quote.author === 'string' ? quote.author : '',
   text: typeof quote.text === 'string' ? quote.text : '',
   meaning: typeof quote.meaning === 'string' ? quote.meaning : '',
   tags: Array.isArray(quote.tags) ? quote.tags : [],
   isFavorited: Boolean(quote.isFavorited),
});

// QuoteComponent definition
const QuoteDeck: React.FC<QuoteProps> = ({quotes: initialQuotes, sx}) => {
   const [quotes, setQuotes] = useState<QuoteRecord[]>(
      Array.isArray(initialQuotes) ? initialQuotes.map(normalizeQuote) : [],
   );
   const [isLoading, setIsLoading] = useState(!initialQuotes?.length);
   const [loadError, setLoadError] = useState<string | null>(null);
   const [currentIndex, setCurrentIndex] = useState(0);
   
   // Force update trigger for favorite toggles
   const [favoriteUpdateTrigger, setFavoriteUpdateTrigger] = useState(0);

   // Derive the current quote from currentIndex and local storage
   const quote = React.useMemo(() => {
     // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _trigger = favoriteUpdateTrigger; // Ensure dependency is used
      const current = quotes[currentIndex];
      const favoriteQuote = getLocalStorageItemById<QuoteRecord>(FAVORITE_QUOTES_KEY, current?.id); // Safe access in case quotes is empty/invalid
      return favoriteQuote ? favoriteQuote : current;
   }, [currentIndex, quotes, favoriteUpdateTrigger]);

   // State to manage Info section toggle per quote
   const [infoState, setInfoState] = useState<boolean>(false);

   const handleNextQuote = () => {
      if (!quotes.length) return;
      setCurrentIndex(prev => (prev + 1) % quotes.length);
      setInfoState(false); // Optionally close info on change
   };

   const handlePrevQuote = () => {
      if (!quotes.length) return;
      setCurrentIndex(prev => (prev - 1 + quotes.length) % quotes.length);
      setInfoState(false);
   };

   const handleToggleFavorite = (id: string) => {
      if (quote && quote.id === id) { // Check if quote exists
         const updatedQuote = {...quote, isFavorited: !quote.isFavorited};
         setLocalStorageItemById(FAVORITE_QUOTES_KEY, updatedQuote);
         setFavoriteUpdateTrigger(prev => prev + 1);
      }
   };

   const handleToggleInfo = () => {
      setInfoState(!infoState);
   };

   useEffect(() => {
      if (initialQuotes && initialQuotes.length) {
         setQuotes(initialQuotes.map(normalizeQuote));
         setIsLoading(false);
         return;
      }

      let isMounted = true;
      setIsLoading(true);
      setLoadError(null);

      fetch('/api/v1/quotes', {
         method: 'GET',
         headers: {
            Accept: 'application/json',
         },
      })
         .then(async response => {
            if (!response.ok) {
               throw new Error('Unable to load quotes');
            }
            const payload = (await response.json()) as {quotes?: QuoteRecord[]};
            const nextQuotes = Array.isArray(payload.quotes)
               ? payload.quotes.map(normalizeQuote)
               : [];
            if (isMounted) {
               setQuotes(nextQuotes);
               setIsLoading(false);
            }
         })
         .catch(error => {
            console.error(error);
            if (isMounted) {
               setLoadError('Unable to load quotes');
               setIsLoading(false);
            }
         });

      return () => {
         isMounted = false;
      };
   }, [initialQuotes]);

   useEffect(() => {
      if (quotes.length) {
         setCurrentIndex(Math.floor(Math.random() * quotes.length));
      }
   }, [quotes.length]);

   if (isLoading) {
      return (
         <Paper variant="outlined" elevation={0} square={false} sx={{p: 2}}>
            <Typography variant="body2">Loading quotes...</Typography>
         </Paper>
      );
   }

   if (loadError) {
      return (
         <Paper variant="outlined" elevation={0} square={false} sx={{p: 2}}>
            <Typography variant="body2">{loadError}</Typography>
         </Paper>
      );
   }

   if (!quote) {
      return (
         <Paper variant="outlined" elevation={0} square={false} sx={{p: 2}}>
            <Typography variant="body2">No quotes available.</Typography>
         </Paper>
      );
   }

   const avatarUrl = quote.author ? `/media/avatar/${quote.author.replace(/ /g, '-')}.jpg` : '';

   return (
      <Paper variant='outlined' elevation={0} square={false}>
         <Card
            variant='outlined'
            sx={{
               ...sx,
               width: '24em',
               height: '28em',
               display: 'flex',
               flexDirection: 'column',
               overflowY: 'auto',
            }}>
            <CardContent
               sx={{
                  flexGrow: 1,
                  overflow: 'hidden',
               }}>
               {/* Added Box to arrange Avatar and Quote Content horizontally */}
               <Box sx={{display: 'flex', alignItems: 'flex-start'}}>
                  {/* Placeholder for Author's Image */}

                  <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: 2}}>
                     <Avatar sx={{width: 100, height: 100}} src={avatarUrl} alt={quote.author}>
                        {quote.author.charAt(0)}
                     </Avatar>
                  </Box>

                  {/* Quote Text and Author */}
                  <Box>
                     <Typography variant='h6' component='span' color='text.primary' gutterBottom sx={{color: theme => theme.palette.text.primary}}>
                        "{quote.text}"{' '}
                     </Typography>
                     <Typography variant='subtitle1' component='span' color='text.secondary' noWrap sx={{color: theme => theme.palette.text.secondary}}>
                        - {quote.author}
                     </Typography>
                     {/* {quote.date && (
                        <Typography variant='body2' color='text.secondary' gutterBottom>
                           Date: {quote.date}
                        </Typography>
                     )} */}
                  </Box>
               </Box>
            </CardContent>
            <Collapse in={infoState} timeout='auto' unmountOnExit>
               <CardContent
                  sx={{
                     flexGrow: 1,
                     overflow: 'hidden',
                  }}>
                  {quote.tags.length > 0 && (
                     <Stack direction='row' spacing={1} sx={{marginY: 1}}>
                        {quote.tags.map(tag => (
                           <Chip key={tag} label={tag} size='small' />
                        ))}
                     </Stack>
                  )}
                  {quote.meaning && (
                     <Typography variant='body1' color='text.primary' sx={{marginTop: 2}}>
                        <strong>Meaning:</strong> {quote.meaning}
                     </Typography>
                  )}
                  {quote.history && (
                     <Typography variant='body2' color='text.secondary' sx={{marginTop: 1}}>
                        <strong>History:</strong> {quote.history}
                     </Typography>
                  )}
                  {quote.reference && (
                     <Typography variant='body2' color='text.secondary' sx={{marginTop: 1}}>
                        <strong>Reference:</strong> {quote.reference}
                     </Typography>
                  )}
               </CardContent>
            </Collapse>
         </Card>
         <Box sx={{display: 'flex', justifyContent: 'flex-end', alignItems: 'end', backgroundColor: 'gray'}}>
            <Box>
               <CopyButton sx={{color: theme => theme.palette.primary.contrastText}} textToCopy={quote.text} />
               <IconButton sx={{color: theme => theme.palette.primary.contrastText}} aria-label='toggle favorite' onClick={() => handleToggleFavorite(quote.id)}>
                  {quote.isFavorited ? <Favorite color='error' /> : <FavoriteBorder />}
               </IconButton>
               <IconButton sx={{color: theme => theme.palette.primary.contrastText}} aria-label={infoState ? 'hide info' : 'show info'} onClick={handleToggleInfo}>
                  <InfoIcon />
               </IconButton>
               <IconButton sx={{color: theme => theme.palette.primary.contrastText}} size='small' onClick={handlePrevQuote} aria-label='previous quote'>
                  <ArrowBackIos fontSize='small' />
               </IconButton>
               <IconButton sx={{color: theme => theme.palette.primary.contrastText}} size='small' onClick={handleNextQuote} aria-label='next quote'>
                  <ArrowForwardIos fontSize='small' />
               </IconButton>
            </Box>
         </Box>
      </Paper>
   );
};

export default QuoteDeck;
