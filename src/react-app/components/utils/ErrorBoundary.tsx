// HEADER-START
// * Path: ./src/components/utils/ErrorBoundary.tsx
// HEADER-END
// src/components/utils/ErrorBoundary.tsx

import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import {Box, Button, Paper, Typography} from '@mui/material';
import React from 'react';

interface ErrorBoundaryState {
   hasError: boolean;
   error: Error | null;
   errorInfo: React.ErrorInfo | null;
}

class ErrorBoundary extends React.Component<{children: React.ReactNode}, ErrorBoundaryState> {
   constructor(props: {children: React.ReactNode}) {
      super(props);
      this.state = {
         hasError: false,
         error: null,
         errorInfo: null,
      };
   }

   static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
      if (process.env.NODE_ENV === 'development') {
         // Re-throw the error to let HMR handle it
         throw error;
      }
      return {hasError: true, error};
   }

   componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
      if (process.env.NODE_ENV !== 'development') {
         // Log the error
         console.error('ErrorBoundary caught an error:', error, errorInfo);
         // Update the state
         this.setState({errorInfo});
      }
   }

   parseErrorStack(error: Error): {fileUrl: string; line: number; column: number} | null {
      if (!error.stack) return null;

      const stackLines = error.stack.split('\n');

      for (const line of stackLines) {
         // Try multiple regex patterns to match different stack trace formats
         let regex = /^\s*at .* \((.*):(\d+):(\d+)\)$/; // Chrome format
         let match = line.match(regex);

         if (!match) {
            regex = /^\s*at (.*):(\d+):(\d+)$/; // Node.js without function name
            match = line.match(regex);
         }

         if (!match) {
            regex = /^(.*)@(.+):(\d+):(\d+)$/; // Firefox and Safari
            match = line.match(regex);
         }

         if (match) {
            const fileUrl = match[1].trim();
            const lineNumber = parseInt(match[2], 10);
            const columnNumber = parseInt(match[3], 10);

            return {fileUrl, line: lineNumber, column: columnNumber};
         }
      }

      return null;
   }

   handleOpenInEditor = () => {
      const {error} = this.state;
      const sourceInfo = this.parseErrorStack(error!);

      if (sourceInfo) {
         fetch(`/__open-in-editor?file=${encodeURIComponent(sourceInfo.fileUrl)}&line=${sourceInfo.line}&column=${sourceInfo.column}`)
            .then(response => {
               if (!response.ok) {
                  throw new Error('Failed to open editor');
               }
            })
            .catch(err => {
               console.error('Error opening editor:', err);
            });
      } else {
         console.warn('Could not parse error stack for editor link.');
      }
   };

   render() {
      const {hasError, error} = this.state;

      if (hasError && error) {
         return (
            <Box
               sx={{
                  padding: 4,
                  backgroundColor: '#f8d7da',
                  color: '#721c24',
                  minHeight: '100vh',
               }}>
               <Typography variant='h4' gutterBottom>
                  Something went wrong.
               </Typography>
               <Typography variant='h6' gutterBottom>
                  {error.message}
               </Typography>

               <Button variant='contained' color='primary' startIcon={<OpenInNewIcon />} onClick={this.handleOpenInEditor} sx={{marginBottom: 2}}>
                  Open in VSCode
               </Button>

               <Typography variant='body1' gutterBottom>
                  Stack Trace:
               </Typography>
               <Paper
                  elevation={3}
                  sx={{
                     margin: 2,
                     padding: 2,
                     textAlign: 'left',
                     overflowX: 'auto',
                     maxHeight: '50vh',
                  }}>
                  <pre>{error.stack}</pre>
               </Paper>
            </Box>
         );
      }

      return this.props.children;
   }
}

export default ErrorBoundary;
