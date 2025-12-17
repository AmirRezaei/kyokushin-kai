// HEADER-START
// * Path: ./src/components/Timer/TempControl.tsx
// HEADER-END
import {Divider, Paper, Stack} from '@mui/material';
import Box from '@mui/material/Box';
import React, {useEffect, useState} from 'react';
import {v4 as uuidv4} from 'uuid';

import {getLocalStorageItem, setLocalStorageItem} from '../utils/localStorageUtils';
import {AddNewTempo} from './AddNewTempo';
import {ExistingTempos} from './ExistingTempos';
import {MetronomePlayer} from './MetronomePlayer';

interface TempControlProps {
   sx?: object;
}

interface Tempo {
   id: string;
   label: string;
   bpm: number;
}

export const TempControl: React.FC<TempControlProps> = ({sx}) => {
   const [tempo, setTempo] = useState<number>(120); // Default tempo is 120 BPM
   const [isPlaying, setIsPlaying] = useState<boolean>(false);
   const [tempos, setTempos] = useState<Tempo[]>([]);

   const addNewTempo = (newTempo: Omit<Tempo, 'id'>) => {
      const {label, bpm} = newTempo;
      if (tempos.some(tempo => tempo.bpm === bpm)) {
         alert('A tempo with this BPM already exists.');
         return;
      }
      const tempoToAdd: Tempo = {
         id: uuidv4(),
         label: label.trim() || `BPM ${bpm}`,
         bpm,
      };
      const updatedTempos = [...tempos, tempoToAdd].sort((a, b) => a.bpm - b.bpm);
      setTempos(updatedTempos);
      setLocalStorageItem('tempos', updatedTempos);
      // Reset tempo if it's the first tempo added
      if (updatedTempos.length === 1) {
         setTempo(bpm);
      }
   };

   const deleteTempo = (id: string) => {
      const tempoToDelete = tempos.find(tempo => tempo.id === id);
      if (!tempoToDelete) return;

      const updatedTempos = tempos.filter(tempo => tempo.id !== id).sort((a, b) => a.bpm - b.bpm);
      setTempos(updatedTempos);
      setLocalStorageItem('tempos', updatedTempos);

      if (tempoToDelete.bpm === tempo) {
         if (updatedTempos.length > 0) {
            setTempo(updatedTempos[0].bpm);
         } else {
            setTempo(60); // Reset to default if no tempos left
         }
      }
   };

   const handleTempoChange = (value: number) => {
      setTempo(value);
   };

   useEffect(() => {
      const storedTempos = getLocalStorageItem<Tempo[]>('tempos', []);
      if (storedTempos.length > 0) {
         const sortedTempos = storedTempos.sort((a, b) => a.bpm - b.bpm);
         setTempos(sortedTempos);
         setTempo(sortedTempos[0].bpm);
      }
   }, []);

   return (
      <Paper sx={sx}>
         <Divider textAlign='left'>Temp Control</Divider>
         <Box sx={{p: 3}}>
            <Stack direction={'column'} spacing={4}>
               <ExistingTempos tempos={tempos} currentTempo={tempo} onTempoChange={handleTempoChange} onDeleteTempo={deleteTempo} />
               <MetronomePlayer isPlaying={isPlaying} setIsPlaying={setIsPlaying} tempo={tempo} />
               <AddNewTempo onAddTempo={addNewTempo} existingBpm={tempos.map(t => t.bpm)} />
            </Stack>
         </Box>
      </Paper>
   );
};
