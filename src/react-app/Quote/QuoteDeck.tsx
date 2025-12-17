// HEADER-START
// * Path: ./src/Quote/QuoteComponent.tsx
// HEADER-END
import {ArrowBackIos, ArrowForwardIos, Favorite, FavoriteBorder, Info as InfoIcon} from '@mui/icons-material';
import {Avatar, Box, BoxProps, Card, CardActions, CardContent, Chip, Collapse, IconButton, Paper, Stack, Typography} from '@mui/material';
import {SxProps, Theme} from '@mui/material/styles';
import React, {useEffect, useState} from 'react';

import CopyButton from '../components/UI/CopyButton';
import {getLocalStorageItemById, setLocalStorageItemById} from '../components/utils/localStorageUtils';
import {Quote} from './Quote';

// Define the component props
interface QuoteProps extends BoxProps {
   quotes: Quote[];
}

const FAVORITE_QUOTES_KEY = 'favoriteQuotes';

// QuoteComponent definition
const QuoteDeck: React.FC<QuoteProps> = ({quotes, sx}) => {
   // Initialize currentIndex to a random index
   const [currentIndex, setCurrentIndex] = useState(() => Math.floor(Math.random() * quotes.length));

   // Derive the current quote from currentIndex
   const [quote, setQuote] = useState<Quote>(() => {
      const initialQuote = quotes[currentIndex];
      const favoriteQuote = getLocalStorageItemById<Quote>(FAVORITE_QUOTES_KEY, initialQuote.id);
      return favoriteQuote ? favoriteQuote : initialQuote;
   });

   // State to manage Info section toggle per quote
   const [infoState, setInfoState] = useState<boolean>(false);

   // Update quote when currentIndex changes
   useEffect(() => {
      const newQuote = quotes[currentIndex];
      const favoriteQuote = getLocalStorageItemById<Quote>(FAVORITE_QUOTES_KEY, newQuote.id);
      setQuote(favoriteQuote ? favoriteQuote : newQuote);
   }, [currentIndex, quotes]);

   const handleNextQuote = () => {
      setCurrentIndex(prev => (prev + 1) % quotes.length);
   };

   const handlePrevQuote = () => {
      setCurrentIndex(prev => (prev - 1 + quotes.length) % quotes.length);
   };

   const handleToggleFavorite = (id: string) => {
      if (quote.id === id) {
         const updatedQuote = {...quote, isFavorited: !quote.isFavorited, toggleFavorite: quote.toggleFavorite, avatar: quote.avatar};
         setQuote(updatedQuote);
         setLocalStorageItemById(FAVORITE_QUOTES_KEY, updatedQuote);
      }
   };

   const handleToggleInfo = () => {
      setInfoState(!infoState);
   };

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
                     <Avatar sx={{width: 100, height: 100}} src={quote.avatar} alt={quote.author}>
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
