// HEADER-START
// * Project: Kyokushin
// * Path: src/components/Training/TrainingSessionList.tsx
// ! Purpose: [Action Required: Summarize the component or file purpose.]
//
// ! Tech Stack and Libraries:
// - Core Frameworks: React, Vite
// - UI/Styling: MUI v6, MUI X Charts, MUI X Data Grid, MUI X Date and Time Pickers, MUI X Tree View, TailwindCSS
// - TypeScript: Strict Mode Enabled
// - Package Manager: Yarn
//
// ? Additional Libraries:
// - Drag-and-Drop: @dnd-kit/core, @dnd-kit/sortable
// - Utilities: Lodash, UUID
// - Data Handling: XLSX, react-papaparse
// - Icons: MUI Icons, React Icons
// - Routing: React Router DOM
//
// ! Development Environment:
// - OS: Windows
// - Tools: PowerShell, VSCode
//
// ! Coding Guidelines:
// 1. Purpose Summary: Provide a concise description of the file's role based on the "Purpose" section.
// 2. Code Quality: Ensure code is readable, maintainable, and optimized for performance.
// 3. State Management: Use immutable state updates and minimize state where possible.
// 4. Rendering Optimization: Utilize React.memo, useCallback, and useMemo to optimize rendering efficiency.
// 5. State Management Libraries: Avoid prop drilling by leveraging Context API or state management libraries.
// 6. Side Effects Management:
//    - Ensure useEffect hooks are idempotent and handle multiple invocations gracefully, especially under React Strict Mode.
//    - Clean up side effects in useEffect and manage dependencies carefully.
//    - Use centralize side-effect operations (e.g., localStorage interactions) to maintain data integrity and ease debugging.
//      - Use utility functions 'getLocalStorageItem' and 'setLocalStorageItem' located at @/components/utils/localStorageUtils.ts.
//        - Function Signatures:
//          - 'const getLocalStorageItem = <T,>(key: string, defaultValue: T): T'
//          - 'const setLocalStorageItem = <T,>(key: string, value: T): void'
// 7. Modularization: Break down large components into smaller, reusable parts.
// 8. Semantic HTML & Styling: Use semantic HTML elements and modular styling approaches (e.g., CSS modules, TailwindCSS).
// 9. Error Handling:
//    - Implement robust error handling.
//    - Provide user-friendly feedback in case of errors.
// 10. Reactive State: Utilize useState or useRef for reactive state management; avoid using global variables.
// 11. Security: Identify and mitigate potential security vulnerabilities (e.g., XSS, injection attacks).
// 12. Code Conciseness: Ensure all generated code is concise and excludes this header.
// 13  This app is a static site with client-side rendering (CSR) where all pages are pre-generated during the build and directly loaded into the browser (e.g., hosted on a static file server or CDN).
// HEADER-END
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, IconButton, List, ListItem, ListItemText, Typography} from '@mui/material';
import React, {useState} from 'react';

import TrainingSessionForm from './TrainingSessionForm';

import { UserTrainingSession } from '../../../data/model/trainingSession';

export type TrainingSession = UserTrainingSession;

interface TrainingSessionListProps {
   sessions: TrainingSession[];
   onDeleteSession: (index: number) => void;
   onEditSession: (index: number, updatedSession: TrainingSession) => void;
}

const TrainingSessionList: React.FC<TrainingSessionListProps> = ({sessions, onDeleteSession, onEditSession}) => {
   const [isEditOpen, setIsEditOpen] = useState(false);
   const [currentEditIndex, setCurrentEditIndex] = useState<number | null>(null);
   const [editData, setEditData] = useState<TrainingSession | null>(null);

   const handleEditClick = (index: number) => {
      setCurrentEditIndex(index);
      setEditData(sessions[index]);
      setIsEditOpen(true);
   };

   const handleDeleteClick = (index: number) => {
      if (window.confirm('Are you sure you want to delete this session?')) {
         onDeleteSession(index);
      }
   };

   const handleEditSubmit = (updatedSession: TrainingSession) => {
      if (currentEditIndex !== null) {
         onEditSession(currentEditIndex, updatedSession);
         setIsEditOpen(false);
         setCurrentEditIndex(null);
         setEditData(null);
      }
   };

   const handleClose = () => {
      setIsEditOpen(false);
      setCurrentEditIndex(null);
      setEditData(null);
   };

   return (
      <Box sx={{p: 2, maxWidth: 600, margin: '0 auto'}}>
         <Typography variant='h6' mb={2}>
            Training Sessions
         </Typography>
         {sessions.length === 0 ? (
            <Typography>No sessions logged yet.</Typography>
         ) : (
            <List>
               {sessions.map((session, index) => (
                  <React.Fragment key={index}>
                     <ListItem
                        secondaryAction={
                           <Box>
                              <IconButton edge='end' aria-label='edit' onClick={() => handleEditClick(index)}>
                                 <EditIcon />
                              </IconButton>
                              <IconButton edge='end' aria-label='delete' onClick={() => handleDeleteClick(index)}>
                                 <DeleteIcon />
                              </IconButton>
                           </Box>
                        }>
                        <ListItemText
                           primary={`${session.date} - ${session.type}`}
                           secondary={
                              <>
                                 <Typography component='span' variant='body2' color='text.primary'>
                                    Duration: {session.duration} minutes | Intensity: {session.intensity}
                                 </Typography>
                                 {session.notes && (
                                    <>
                                       <br />
                                       <Typography component='span' variant='body2' color='text.secondary'>
                                          Notes: {session.notes}
                                       </Typography>
                                    </>
                                 )}
                              </>
                           }
                        />
                     </ListItem>
                     {index < sessions.length - 1 && <Divider />}
                  </React.Fragment>
               ))}
            </List>
         )}

         {/* Edit Dialog */}
         <Dialog open={isEditOpen} onClose={handleClose} fullWidth maxWidth='sm'>
            <DialogTitle>Edit Training Session</DialogTitle>
            <DialogContent>{editData && <TrainingSessionForm key={editData.id} onAddSession={handleEditSubmit} initialData={editData} isEditMode />}</DialogContent>
            <DialogActions>
               <Button onClick={handleClose} color='secondary'>
                  Cancel
               </Button>
            </DialogActions>
         </Dialog>
      </Box>
   );
};

export default TrainingSessionList;
