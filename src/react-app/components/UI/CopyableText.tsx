// HEADER-START
// * Path: ./src/components/UI/CopyableText.tsx
// HEADER-END

import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import {useTheme} from '@mui/material/styles';
import {TypographyProps} from '@mui/material/Typography';
import React, {KeyboardEvent, ReactElement, useState} from 'react';

interface CopyableTextProps {
   /**
    * A single Typography component as a child.
    */
   children: ReactElement<TypographyProps>;

   /**
    * Optional text to copy. If not provided, the component will attempt to extract text from the Typography child.
    */
   copyText?: string;
}

/**
 * Attempts to use the newer Clipboard API to copy text.
 */
async function clipboardApiCopy(text: string): Promise<void> {
   if (navigator?.clipboard?.writeText) {
      return navigator.clipboard.writeText(text);
   } else {
      throw new Error('Clipboard API not supported');
   }
}

/**
 * Fallback method for older browsers and some devices:
 * Creates a temporary textarea, selects its content, and uses `document.execCommand('copy')`.
 */
export function fallbackCopyTextToClipboard(text: string): Promise<void> {
   return new Promise<void>((resolve, reject) => {
      const textArea = document.createElement('textarea');
      textArea.value = text;

      // Move the textarea out of the visible area to reduce visual flicker
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      textArea.style.top = '0';

      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
         const successful = document.execCommand('copy');
         if (successful) {
            resolve();
         } else {
            reject(new Error("execCommand('copy') failed."));
         }
      } catch (err) {
         reject(err);
      } finally {
         document.body.removeChild(textArea);
      }
   });
}

/**
 * Attempts to copy text using the Clipboard API, then falls back to the
 * `execCommand` method if needed. This approach tries to ensure maximum compatibility
 * with a variety of browsers and devices.
 */
async function copyTextToClipboard(text: string): Promise<void> {
   try {
      await clipboardApiCopy(text);
   } catch {
      // If Clipboard API fails or not supported, try fallback
      await fallbackCopyTextToClipboard(text);
   }
}

const CopyableText: React.FC<CopyableTextProps> = ({children, copyText}) => {
   const theme = useTheme();
   const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
   const [snackbarMessage, setSnackbarMessage] = useState<string>('');

   /**
    * Extracts plain text from ReactNode children.
    * Note: This is a simple implementation and may need enhancements for complex children.
    */
   const getTextFromChildren = (children: React.ReactNode): string => {
      if (typeof children === 'string') {
         return children;
      }
      if (Array.isArray(children)) {
         return children.map(child => getTextFromChildren(child)).join('');
      }
      if (React.isValidElement(children) && typeof children.props.children === 'string') {
         return children.props.children;
      }
      return '';
   };

   const handleCopy = async () => {
      if (typeof window === 'undefined') {
         setSnackbarMessage('Unable to copy on this platform.');
         setOpenSnackbar(true);
         return;
      }

      const textToCopy = copyText ?? getTextFromChildren(children.props.children);

      try {
         await copyTextToClipboard(textToCopy);
         setSnackbarMessage('Copied to clipboard!');
         setOpenSnackbar(true);
      } catch {
         // Handle the error appropriately, e.g., log to an external service
         setSnackbarMessage('Failed to copy!');
         setOpenSnackbar(true);
      }
   };

   const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
      if (reason === 'clickaway') {
         return;
      }
      setOpenSnackbar(false);
   };

   const handleKeyPress = (event: KeyboardEvent<HTMLSpanElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
         event.preventDefault();
         handleCopy();
      }
   };

   // Clone the Typography child to add event handlers and accessibility features
   const clonedChild = React.cloneElement(children, {
      'onClick': (event: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
         handleCopy();
         if (children.props.onClick) {
            children.props.onClick(event);
         }
      },
      'onKeyPress': handleKeyPress,
      'role': 'button',
      'tabIndex': 0,
      'aria-label': 'Copy text',
      'sx': {
         'cursor': 'pointer',
         'userSelect': 'none',
         '&:hover': {
            textDecoration: 'underline',
         },
         'outline': 'none',
         '&:focus-visible': {
            boxShadow: `0 0 0 2px ${theme.palette.primary.main}`,
            borderRadius: theme.shape.borderRadius,
         },
         ...children.props.sx, // Preserve existing styles
      },
   });

   return (
      <>
         {clonedChild}
         <Snackbar
            open={openSnackbar}
            autoHideDuration={3000}
            onClose={handleCloseSnackbar}
            anchorOrigin={{
               vertical: 'bottom',
               horizontal: 'center',
            }}>
            <Alert
               onClose={handleCloseSnackbar}
               severity={snackbarMessage === 'Copied to clipboard!' ? 'success' : 'error'}
               sx={{
                  width: '100%',
                  backgroundColor: snackbarMessage === 'Copied to clipboard!' ? theme.palette.success.main : theme.palette.error.main,
               }}>
               {snackbarMessage}
            </Alert>
         </Snackbar>
      </>
   );
};

export default CopyableText;
