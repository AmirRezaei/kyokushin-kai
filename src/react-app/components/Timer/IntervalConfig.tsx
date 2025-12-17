// HEADER-START
// * Project: Kyokushin
// * Path: src/components/Timer/IntervalConfig.tsx
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
'use client';

import AddIcon from '@mui/icons-material/Add';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CopyIcon from '@mui/icons-material/FileCopy';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Slider from '@mui/material/Slider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import {useCallback, useEffect, useState} from 'react';

export interface Interval {
   name: string;
   duration: number;
   countDown: number;
   repeat: number;
   type: 'Action' | 'Pause' | 'Count Down';
   tempoId?: string;
}

export interface Tempo {
   id: string;
   label: string;
   bpm: number;
}

interface IntervalConfigProps {
   onSave: (intervals: Interval[]) => void;
   initialIntervals: Interval[];
}

export const IntervalConfig: React.FC<IntervalConfigProps> = ({onSave, initialIntervals}) => {
   const [intervals, setIntervals] = useState<Interval[]>(initialIntervals || []);
   const [dialogOpen, setDialogOpen] = useState(false);
   const [editingIndex, setEditingIndex] = useState<number | null>(null);
   const [currentInterval, setCurrentInterval] = useState<Interval | null>(null);
   const [tempos, setTempos] = useState<Tempo[]>([]);
   const [temposLoaded, setTemposLoaded] = useState(false);

   // Load tempos from localStorage
   useEffect(() => {
      const loadTempos = () => {
         const storedTempos = localStorage.getItem('tempos');
         if (storedTempos) {
            try {
               const parsedTempos = JSON.parse(storedTempos);
               if (Array.isArray(parsedTempos)) {
                  setTempos(parsedTempos);
               }
            } catch (error) {
               console.error('Failed to parse tempos from localStorage', error);
               setTempos([]);
            }
         } else {
            setTempos([]);
         }
         setTemposLoaded(true);
      };
      loadTempos();
   }, []);

   // Load intervals from localStorage after tempos are loaded
   useEffect(() => {
      if (!temposLoaded) return; // Ensure tempos are loaded first

      const loadIntervals = () => {
         const storedIntervals = localStorage.getItem('intervals');
         if (storedIntervals) {
            try {
               const parsedIntervals = JSON.parse(storedIntervals);
               if (Array.isArray(parsedIntervals)) {
                  // Validate tempoId against loaded tempos
                  const validIntervals = parsedIntervals.map((interval: Interval) => ({
                     ...interval,
                     tempoId: tempos.find(t => t.id === interval.tempoId) ? interval.tempoId : undefined, // Reset if invalid
                  }));
                  setIntervals(validIntervals);
               }
            } catch (error) {
               console.error('Failed to parse intervals from localStorage', error);
            }
         }
      };
      loadIntervals();
   }, [temposLoaded, tempos]);

   // Save intervals to localStorage whenever they change
   useEffect(() => {
      try {
         localStorage.setItem('intervals', JSON.stringify(intervals));
      } catch (error) {
         console.error('Failed to save intervals to localStorage', error);
      }
   }, [intervals]);

   const handleOpenDialog = useCallback(
      (index: number | null = null) => {
         if (!temposLoaded) {
            // Wait until tempos are loaded
            return;
         }

         if (index !== null) {
            const interval = intervals[index];
            setCurrentInterval(interval);
            setEditingIndex(index);
         } else {
            setCurrentInterval({
               name: '',
               duration: 0,
               countDown: 0,
               repeat: 1,
               type: 'Action',
               tempoId: undefined,
            });
            setEditingIndex(null);
         }
         setDialogOpen(true);
      },
      [intervals, temposLoaded],
   );

   const handleSaveInterval = useCallback(() => {
      if (!currentInterval) {
         return;
      }
      const updatedIntervals = [...intervals];
      if (editingIndex !== null) {
         updatedIntervals[editingIndex] = currentInterval;
      } else {
         updatedIntervals.push(currentInterval);
      }
      setIntervals(updatedIntervals);
      setDialogOpen(false);
      setCurrentInterval(null);
   }, [currentInterval, editingIndex, intervals]);

   const handleCopyInterval = useCallback(
      (index: number) => {
         const copiedInterval = {...intervals[index]};
         setIntervals([...intervals, copiedInterval]);
      },
      [intervals],
   );

   const handleDeleteInterval = useCallback(
      (index: number) => {
         const updatedIntervals = intervals.filter((_, i) => i !== index);
         setIntervals(updatedIntervals);
      },
      [intervals],
   );

   const handleMoveUp = useCallback(
      (index: number) => {
         if (index > 0) {
            const updatedIntervals = [...intervals];
            [updatedIntervals[index - 1], updatedIntervals[index]] = [updatedIntervals[index], updatedIntervals[index - 1]];
            setIntervals(updatedIntervals);
         }
      },
      [intervals],
   );

   const handleMoveDown = useCallback(
      (index: number) => {
         if (index < intervals.length - 1) {
            const updatedIntervals = [...intervals];
            [updatedIntervals[index + 1], updatedIntervals[index]] = [updatedIntervals[index], updatedIntervals[index + 1]];
            setIntervals(updatedIntervals);
         }
      },
      [intervals],
   );

   const handleSliderChange = useCallback((field: keyof Interval, value: number) => {
      setCurrentInterval(prev => (prev ? {...prev, [field]: value} : prev));
   }, []);

   return (
      <>
         <List>
            {intervals.map((interval, index) => {
               const tempo = tempos.find(t => t.id === interval.tempoId);
               return (
                  <ListItem key={index} className='flex items-center'>
                     <ListItemText primary={`${interval.name} (${interval.type}): ${interval.duration.toFixed(2)}s ${interval.type === 'Action' ? `(x${interval.repeat})` : ''}`} secondary={tempo ? `Tempo: ${tempo.label} (${tempo.bpm} BPM)` : 'No Tempo Selected'} />
                     <IconButton onClick={() => handleMoveUp(index)} disabled={index === 0} aria-label='Move Up'>
                        <ArrowUpwardIcon />
                     </IconButton>
                     <IconButton onClick={() => handleMoveDown(index)} disabled={index === intervals.length - 1} aria-label='Move Down'>
                        <ArrowDownwardIcon />
                     </IconButton>
                     <IconButton onClick={() => handleOpenDialog(index)} aria-label='Edit Interval'>
                        <EditIcon />
                     </IconButton>
                     <IconButton onClick={() => handleCopyInterval(index)} aria-label='Copy Interval'>
                        <CopyIcon />
                     </IconButton>
                     <IconButton onClick={() => handleDeleteInterval(index)} aria-label='Delete Interval'>
                        <DeleteIcon />
                     </IconButton>
                  </ListItem>
               );
            })}
         </List>
         <div className='mt-4 flex'>
            <Button variant='outlined' startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
               Add Interval
            </Button>
            <Button variant='contained' color='primary' onClick={() => onSave(intervals)} className='ml-2'>
               Save Intervals
            </Button>
         </div>
         <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth='sm'>
            <DialogTitle>{editingIndex !== null ? 'Edit Interval' : 'Add Interval'}</DialogTitle>
            {currentInterval && (
               <DialogContent>
                  <Select
                     label='Interval Type'
                     fullWidth
                     value={currentInterval.type}
                     onChange={e => {
                        const type = e.target.value as 'Action' | 'Pause' | 'Count Down';
                        setCurrentInterval(prev =>
                           prev
                              ? {
                                   ...prev,
                                   type,
                                   name: type,
                                   tempoId: type === 'Pause' || type === 'Count Down' ? undefined : prev.tempoId,
                                }
                              : prev,
                        );
                     }}
                     className='mb-5'>
                     <MenuItem value='Action'>Action</MenuItem>
                     <MenuItem value='Pause'>Pause</MenuItem>
                     <MenuItem value='Count Down'>Count Down</MenuItem>
                  </Select>
                  <TextField
                     label='Interval Name'
                     fullWidth
                     value={currentInterval.name}
                     disabled={currentInterval.type === 'Pause' || currentInterval.type === 'Count Down'}
                     onChange={e =>
                        setCurrentInterval(prev =>
                           prev
                              ? {
                                   ...prev,
                                   name: e.target.value,
                                }
                              : prev,
                        )
                     }
                     className='mb-5'
                  />
                  <TextField
                     label='Duration (seconds)'
                     type='number'
                     fullWidth
                     value={currentInterval.duration}
                     onChange={e =>
                        setCurrentInterval(prev =>
                           prev
                              ? {
                                   ...prev,
                                   duration: parseFloat(e.target.value),
                                }
                              : prev,
                        )
                     }
                     className='mb-5'
                  />
                  <Typography gutterBottom>Count Down (seconds)</Typography>
                  <Slider
                     sx={{mt: 4, ml: 2}}
                     valueLabelDisplay='on'
                     value={currentInterval.countDown ?? 0}
                     getAriaValueText={currentInterval => {
                        return currentInterval.toString();
                     }}
                     onChange={(e, value) => handleSliderChange('countDown', value as number)}
                     aria-labelledby='count-down-slider'
                     step={1}
                     marks={[
                        {value: 0, label: '0'}, // Label for minimum
                        {value: 10, label: '10'}, // Label for maximum
                     ]}
                     min={0}
                     max={10}
                     className='mb-5'
                  />

                  <Typography gutterBottom>Repeat Count</Typography>
                  <Slider
                     sx={{mt: 4, ml: 2}}
                     valueLabelDisplay='on'
                     value={currentInterval.repeat}
                     onChange={(e, value) => handleSliderChange('repeat', value as number)}
                     aria-labelledby='repeat-count-slider'
                     step={1}
                     marks={[
                        {value: 0, label: '0'}, // Label for minimum
                        {value: 20, label: '20'}, // Label for maximum
                     ]}
                     min={1}
                     max={20}
                     className='mb-5'
                  />
                  {currentInterval.type === 'Action' && (
                     <>
                        {tempos.length > 0 ? (
                           <Select
                              label='Tempo'
                              fullWidth
                              value={tempos.some(t => t.id === currentInterval.tempoId) ? currentInterval.tempoId : ''}
                              onChange={e => {
                                 const tempoId = e.target.value as string;
                                 setCurrentInterval(prev =>
                                    prev
                                       ? {
                                            ...prev,
                                            tempoId: tempoId,
                                         }
                                       : prev,
                                 );
                              }}
                              className='mb-5'>
                              <MenuItem value=''>Select Tempo</MenuItem>
                              {tempos.map(tempo => (
                                 <MenuItem key={tempo.id} value={tempo.id}>
                                    {tempo.label} ({tempo.bpm} BPM)
                                 </MenuItem>
                              ))}
                           </Select>
                        ) : (
                           <Typography className='mb-5'>No tempos available. Please create tempos in TempControl.</Typography>
                        )}
                     </>
                  )}
               </DialogContent>
            )}
            <DialogActions>
               <Button onClick={() => setDialogOpen(false)} color='secondary'>
                  Cancel
               </Button>
               <Button onClick={handleSaveInterval} color='primary' variant='contained'>
                  Save
               </Button>
            </DialogActions>
         </Dialog>
      </>
   );
};
