// File: ./src/components/TrainingSessionManager.tsx

// HEADER-START
// * Path: ./src/components/TrainingSessionManager.tsx
// HEADER-END

// ./src/components/TrainingSessionManager.tsx
'use client';
// ./src/components/TrainingSessionManager.tsx
import AddIcon from '@mui/icons-material/Add';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PreviewIcon from '@mui/icons-material/Preview';
import UploadIcon from '@mui/icons-material/Upload';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import React, {useEffect, useState} from 'react';

import {TechniqueCombo} from '@/app/Technique/TechniqueData';

interface TrainingSession {
   name: string;
   combos: TechniqueCombo[];
}

const TrainingSessionManager: React.FC = () => {
   // Retrieve savedCombos from localStorage
   const [savedCombos, setSavedCombos] = useState<TechniqueCombo[]>([]);
   useEffect(() => {
      const storedCombos = localStorage.getItem('savedCombos');
      if (storedCombos) {
         let parsedCombos = JSON.parse(storedCombos);
         setSavedCombos(parsedCombos);
      }
   }, []);

   // State for saved training sessions
   const [savedSessions, setSavedSessions] = useState<TrainingSession[]>(() => {
      const storedSessions = localStorage.getItem('savedTrainingSessions');
      if (storedSessions) {
         return JSON.parse(storedSessions);
      }
      return [];
   });

   useEffect(() => {
      localStorage.setItem('savedTrainingSessions', JSON.stringify(savedSessions));
   }, [savedSessions]);

   // State for the current session being edited
   const [currentSession, setCurrentSession] = useState<TrainingSession | null>(null);
   const [sessionDialogOpen, setSessionDialogOpen] = useState(false);
   const [sessionName, setSessionName] = useState('');
   const [selectedCombos, setSelectedCombos] = useState<TechniqueCombo[]>([]);

   // State for preview mode
   const [previewMode, setPreviewMode] = useState(false);
   const [currentSessionIndex, setCurrentSessionIndex] = useState<number | null>(null);
   const [currentComboIndex, setCurrentComboIndex] = useState(0);
   const [currentTechniqueIndex, setCurrentTechniqueIndex] = useState(0);

   // Functions to handle adding a new session, editing sessions, etc.
   const handleCreateNewSession = () => {
      setCurrentSession(null);
      setSessionName('');
      setSelectedCombos([]);
      setSessionDialogOpen(true);
   };

   const editSession = (index: number) => {
      const sessionToEdit = savedSessions[index];
      setCurrentSession(sessionToEdit);
      setSessionName(sessionToEdit.name);
      setSelectedCombos(sessionToEdit.combos);
      setSessionDialogOpen(true);
   };

   const saveSession = () => {
      const newSession: TrainingSession = {
         name: sessionName || `Session ${savedSessions.length + 1}`,
         combos: selectedCombos,
      };
      if (currentSession) {
         // Editing existing session
         const updatedSessions = savedSessions.map(session => (session === currentSession ? newSession : session));
         setSavedSessions(updatedSessions);
      } else {
         // Creating new session
         setSavedSessions([...savedSessions, newSession]);
      }
      setSessionDialogOpen(false);
      setCurrentSession(null);
      setSessionName('');
      setSelectedCombos([]);
   };

   const closeSessionDialog = () => {
      setSessionDialogOpen(false);
      setCurrentSession(null);
      setSessionName('');
      setSelectedCombos([]);
   };

   const toggleComboSelection = (combo: TechniqueCombo) => {
      const index = selectedCombos.findIndex(c => c.name === combo.name);
      if (index === -1) {
         setSelectedCombos([...selectedCombos, combo]);
      } else {
         setSelectedCombos(selectedCombos.filter(c => c.name !== combo.name));
      }
   };

   const moveComboInCurrentSession = (index: number, direction: 'up' | 'down') => {
      if ((direction === 'up' && index === 0) || (direction === 'down' && index === selectedCombos.length - 1)) {
         return;
      }
      const swapIndex = direction === 'up' ? index - 1 : index + 1;
      const newCombos = [...selectedCombos];
      [newCombos[index], newCombos[swapIndex]] = [newCombos[swapIndex], newCombos[index]];
      setSelectedCombos(newCombos);
   };

   const removeComboFromCurrentSession = (index: number) => {
      const newCombos = [...selectedCombos];
      newCombos.splice(index, 1);
      setSelectedCombos(newCombos);
   };

   const addComboToCurrentSession = (combo: TechniqueCombo) => {
      setSelectedCombos([...selectedCombos, combo]);
   };

   const moveComboInSession = (sessionIndex: number, comboIndex: number, direction: 'up' | 'down') => {
      const updatedSessions = [...savedSessions];
      const session = updatedSessions[sessionIndex];
      if ((direction === 'up' && comboIndex === 0) || (direction === 'down' && comboIndex === session.combos.length - 1)) {
         return;
      }
      const swapIndex = direction === 'up' ? comboIndex - 1 : comboIndex + 1;
      [session.combos[comboIndex], session.combos[swapIndex]] = [session.combos[swapIndex], session.combos[comboIndex]];
      setSavedSessions(updatedSessions);
   };

   const removeComboFromSession = (sessionIndex: number, comboIndex: number) => {
      const updatedSessions = [...savedSessions];
      const session = updatedSessions[sessionIndex];
      session.combos.splice(comboIndex, 1);
      setSavedSessions(updatedSessions);
   };

   const deleteSession = (index: number) => {
      setSavedSessions(savedSessions.filter((_, i) => i !== index));
   };

   const duplicateSession = (index: number) => {
      const sessionToDuplicate = savedSessions[index];
      const newSession = {
         ...sessionToDuplicate,
         name: sessionToDuplicate.name + ' (Copy)',
      };
      setSavedSessions([...savedSessions, newSession]);
   };

   const exportSessions = () => {
      const dataStr = JSON.stringify(savedSessions, null, 2);
      const blob = new Blob([dataStr], {
         type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'training_sessions.json';
      a.click();
   };

   const importSessions = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
         const reader = new FileReader();
         reader.onload = e => {
            const content = e.target?.result as string;
            const importedSessions = JSON.parse(content);
            setSavedSessions(importedSessions);
         };
         reader.readAsText(file);
      }
   };

   const startSessionPreview = (sessionIndex: number) => {
      setCurrentSessionIndex(sessionIndex);
      setCurrentComboIndex(0);
      setCurrentTechniqueIndex(0);
      setPreviewMode(true);
   };

   const nextTechnique = () => {
      if (currentSessionIndex !== null) {
         const session = savedSessions[currentSessionIndex];
         const combo = session.combos[currentComboIndex];
         if (currentTechniqueIndex < combo.techniques.length - 1) {
            setCurrentTechniqueIndex(currentTechniqueIndex + 1);
         } else if (currentComboIndex < session.combos.length - 1) {
            setCurrentComboIndex(currentComboIndex + 1);
            setCurrentTechniqueIndex(0);
         } else {
            // End of session
            setPreviewMode(false);
         }
      }
   };

   const prevTechnique = () => {
      if (currentSessionIndex !== null) {
         if (currentTechniqueIndex > 0) {
            setCurrentTechniqueIndex(currentTechniqueIndex - 1);
         } else if (currentComboIndex > 0) {
            const session = savedSessions[currentSessionIndex];
            const prevCombo = session.combos[currentComboIndex - 1];
            setCurrentComboIndex(currentComboIndex - 1);
            setCurrentTechniqueIndex(prevCombo.techniques.length - 1);
         }
      }
   };

   const closePreview = () => {
      setPreviewMode(false);
      setCurrentSessionIndex(null);
      setCurrentComboIndex(0);
      setCurrentTechniqueIndex(0);
   };

   return (
      <Container>
         <Box marginTop={2}>
            <Typography variant='h4' gutterBottom>
               Training Session Manager
            </Typography>
            <Button variant='contained' color='primary' startIcon={<AddIcon />} onClick={handleCreateNewSession}>
               New Training Session
            </Button>
            <Button
               variant='contained'
               color='secondary'
               startIcon={<UploadIcon />}
               onClick={exportSessions}
               style={{
                  marginLeft: '1em',
               }}>
               Export Sessions
            </Button>
            <input
               accept='application/json'
               style={{
                  display: 'none',
               }}
               id='import-sessions'
               type='file'
               onChange={importSessions}
            />
            <label htmlFor='import-sessions'>
               <Button
                  variant='contained'
                  color='secondary'
                  component='span'
                  startIcon={<DownloadIcon />}
                  style={{
                     marginLeft: '1em',
                  }}>
                  Import Sessions
               </Button>
            </label>
         </Box>

         {/* List of sessions */}
         <List>
            {savedSessions.map((session, index) => (
               <Accordion
                  key={index}
                  style={{
                     marginTop: '1em',
                  }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                     <Typography>{session.name}</Typography>
                     <Box
                        sx={{
                           marginLeft: 'auto',
                        }}>
                        <IconButton
                           edge='end'
                           aria-label='duplicate'
                           onClick={event => {
                              event.stopPropagation();
                              duplicateSession(index);
                           }}>
                           <ContentCopyIcon />
                        </IconButton>
                        <IconButton
                           edge='end'
                           aria-label='delete'
                           onClick={event => {
                              event.stopPropagation();
                              deleteSession(index);
                           }}>
                           <DeleteIcon />
                        </IconButton>
                     </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                     {/* List of combos in the session */}
                     <List>
                        {session.combos.map((combo, comboIndex) => (
                           <ListItem key={comboIndex}>
                              <ListItemText primary={combo.name} />
                              {/* Buttons to move combo up/down, remove from session */}
                              <IconButton onClick={() => moveComboInSession(index, comboIndex, 'up')}>
                                 <ArrowUpwardIcon />
                              </IconButton>
                              <IconButton onClick={() => moveComboInSession(index, comboIndex, 'down')}>
                                 <ArrowDownwardIcon />
                              </IconButton>
                              <IconButton onClick={() => removeComboFromSession(index, comboIndex)}>
                                 <DeleteIcon />
                              </IconButton>
                           </ListItem>
                        ))}
                     </List>
                     {/* Buttons to edit session */}
                     <Box
                        sx={{
                           display: 'flex',
                           justifyContent: 'flex-end',
                           marginTop: '1em',
                        }}>
                        <Button onClick={() => editSession(index)} startIcon={<EditIcon />}>
                           Edit Session
                        </Button>
                        <Button onClick={() => startSessionPreview(index)} startIcon={<PreviewIcon />}>
                           Start Session
                        </Button>
                     </Box>
                  </AccordionDetails>
               </Accordion>
            ))}
         </List>

         {/* Dialogs for creating/editing sessions */}
         <Dialog open={sessionDialogOpen} onClose={closeSessionDialog} fullWidth maxWidth='md'>
            <DialogTitle>{currentSession ? 'Edit Training Session' : 'New Training Session'}</DialogTitle>
            <DialogContent>
               {/* Fields to edit session name, select combos */}
               <TextField label='Session Name' value={sessionName} onChange={e => setSessionName(e.target.value)} fullWidth margin='normal' />
               {/* List of selected combos with options to move up/down, remove */}
               <Typography variant='h6'>Selected Combos</Typography>
               <List>
                  {selectedCombos.map((combo: TechniqueCombo, index) => (
                     <ListItem key={index}>
                        <ListItemText primary={combo.name} />
                        <IconButton onClick={() => moveComboInCurrentSession(index, 'up')}>
                           <ArrowUpwardIcon />
                        </IconButton>
                        <IconButton onClick={() => moveComboInCurrentSession(index, 'down')}>
                           <ArrowDownwardIcon />
                        </IconButton>
                        <IconButton onClick={() => removeComboFromCurrentSession(index)}>
                           <DeleteIcon />
                        </IconButton>
                     </ListItem>
                  ))}
               </List>
               {/* List of available combos to add */}
               <Typography
                  variant='h6'
                  style={{
                     marginTop: '1em',
                  }}>
                  Available Combos
               </Typography>
               <List>
                  {savedCombos
                     .filter(combo => !selectedCombos.some(c => c.name === combo.name))
                     .map((combo, index) => (
                        <ListItem key={index} onClick={() => addComboToCurrentSession(combo)}>
                           <ListItemText primary={combo.name} />
                           <IconButton>
                              <AddIcon />
                           </IconButton>
                        </ListItem>
                     ))}
               </List>
            </DialogContent>
            <DialogActions>
               <Button onClick={closeSessionDialog}>Cancel</Button>
               <Button onClick={saveSession}>Save</Button>
            </DialogActions>
         </Dialog>

         {/* Session Preview Dialog */}
         {previewMode && (
            <Dialog open={previewMode} onClose={closePreview} fullWidth maxWidth='sm'>
               <DialogTitle>Session Preview</DialogTitle>
               <DialogContent>
                  {currentSessionIndex !== null && (
                     <>
                        <Typography variant='h6'>{savedSessions[currentSessionIndex].combos[currentComboIndex].techniques[currentTechniqueIndex].romaji}</Typography>
                        <Typography variant='body1'>Combo: {savedSessions[currentSessionIndex].combos[currentComboIndex].name}</Typography>
                        <Typography variant='body2'>
                           Step {currentTechniqueIndex + 1} of {savedSessions[currentSessionIndex].combos[currentComboIndex].techniques.length}
                        </Typography>
                     </>
                  )}
               </DialogContent>
               <DialogActions>
                  <Button onClick={prevTechnique} disabled={currentComboIndex === 0 && currentTechniqueIndex === 0}>
                     Previous
                  </Button>
                  <Button onClick={nextTechnique}>Next</Button>
               </DialogActions>
            </Dialog>
         )}
      </Container>
   );
};

export default TrainingSessionManager;
