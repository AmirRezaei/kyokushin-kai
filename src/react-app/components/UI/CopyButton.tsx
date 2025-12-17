// HEADER-START
// * Path: ./src/components/UI/CopyButton.tsx
// HEADER-END
import {ThemeContext} from '@emotion/react';
import {ContentCopy as ContentCopyIcon} from '@mui/icons-material';
import {Alert, Box, IconButton, Snackbar, SxProps, Theme} from '@mui/material';
import React, {useState} from 'react';

import {fallbackCopyTextToClipboard} from './CopyableText';

interface CopyButtonProps {
   textToCopy: string;
   sx?: SxProps<Theme>;
}

const CopyButton: React.FC<CopyButtonProps> = ({textToCopy, sx}) => {
   const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
   const [snackbarMessage, setSnackbarMessage] = useState<string>('');
   const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

   const handleCopy = async () => {
      try {
         await fallbackCopyTextToClipboard(textToCopy);
         setSnackbarMessage('Copied to clipboard!');
         setSnackbarSeverity('success');
      } catch {
         setSnackbarMessage('Failed to copy!');
         setSnackbarSeverity('error');
      }
      setOpenSnackbar(true);
   };

   const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
      if (reason === 'clickaway') {
         return;
      }
      setOpenSnackbar(false);
   };

   return (
      <>
         <IconButton sx={{...sx}} aria-label='copy quote' onClick={handleCopy}>
            <ContentCopyIcon />
         </IconButton>
         <Snackbar open={openSnackbar} autoHideDuration={3000} onClose={handleCloseSnackbar} anchorOrigin={{vertical: 'bottom', horizontal: 'center'}}>
            <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{width: '100%'}}>
               {snackbarMessage}
            </Alert>
         </Snackbar>
      </>
   );
};

export default CopyButton;
