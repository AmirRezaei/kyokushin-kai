// File: ./src/components/Timer/TempManager.tsx

import DeleteIcon from '@mui/icons-material/Delete';
import {Box, Button, IconButton, Paper, Typography} from '@mui/material';
import {useState} from 'react';

import {MetronomePlayer} from './MetronomePlayer';

interface Tempo {
   id: string;
   label: string;
   bpm: number;
}

export const TempManager: React.FC = () => {
   const [tempos, setTempos] = useState<Tempo[]>([
      {id: '1', label: 'Allegro', bpm: 120},
      {id: '2', label: 'Moderato', bpm: 100},
   ]);
   const [tempo, setTempo] = useState<number>(120); // Default to the first tempo
   const [isPlaying, setIsPlaying] = useState<boolean>(false);

   const handleTempoChange = (bpm: number) => {
      setTempo(bpm);
   };

   const deleteTempo = (id: string) => {
      setTempos(prevTempos => prevTempos.filter(tempo => tempo.id !== id));
   };

   return (
      <Paper elevation={3} sx={{p: 3}}>
         <Typography variant='h5' align='center' gutterBottom>
            Existing Tempos
         </Typography>
         <Box>
            {tempos.map(tempoOption => (
               <Box key={tempoOption.id} display='flex' justifyContent='space-between' alignItems='center' mb={1}>
                  <Button variant='contained' onClick={() => handleTempoChange(tempoOption.bpm)} sx={{flexGrow: 1, marginRight: 1}}>
                     {tempoOption.label} ({tempoOption.bpm} BPM)
                  </Button>
                  <IconButton color='error' onClick={() => deleteTempo(tempoOption.id)}>
                     <DeleteIcon />
                  </IconButton>
               </Box>
            ))}
         </Box>
         <MetronomePlayer isPlaying={isPlaying} setIsPlaying={setIsPlaying} tempo={tempo} />
      </Paper>
   );
};
