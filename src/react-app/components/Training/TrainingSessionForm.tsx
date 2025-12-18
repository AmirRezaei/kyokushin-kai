import {Box, Button, MenuItem, TextField, Typography} from '@mui/material';
import React, {useState} from 'react';
import { UserTrainingSession } from '../../../data/model/trainingSession';

export type TrainingSession = UserTrainingSession;

interface TrainingSessionFormProps {
   onAddSession: (session: TrainingSession) => void;
   initialData?: TrainingSession;
   isEditMode?: boolean;
}

const TrainingSessionForm: React.FC<TrainingSessionFormProps> = ({onAddSession, initialData, isEditMode = false}) => {
   const [formData, setFormData] = useState<TrainingSession>(() => {
      if (initialData) return initialData;
      return {
         id: '', 
         date: new Date().toISOString().split('T')[0],
         type: 'Kihon',
         duration: 60,
         intensity: 'Moderate',
         notes: '',
      };
   });

   const handleChange = (field: keyof TrainingSession) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = field === 'duration' ? Number(e.target.value) : e.target.value;
      setFormData({...formData, [field]: value});
   };

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onAddSession(formData);
      if (!isEditMode) {
         setFormData({
            id: '',
            date: new Date().toISOString().split('T')[0],
            type: 'Kihon',
            duration: 60,
            intensity: 'Moderate',
            notes: '',
         });
      }
   };

   const formatDuration = (minutes: number) => {
       if (minutes < 60) return `${minutes} min`;
       const h = Math.floor(minutes / 60);
       const m = minutes % 60;
       return m === 0 ? `${h}h` : `${h}.${m}h`;
   };

   return (
      <Box component='form' onSubmit={handleSubmit} sx={{p: 2, maxWidth: 400, margin: '0 auto'}}>
         <Typography variant='h6' mb={2}>
            {isEditMode ? 'Edit Training Session' : 'Log Training Session'}
         </Typography>
         <TextField label='Date' type='date' value={formData.date} onChange={handleChange('date')} fullWidth required InputLabelProps={{shrink: true}} sx={{mb: 2}} />
         <TextField label='Type' select value={formData.type} onChange={handleChange('type')} fullWidth required sx={{mb: 2}}>
            {['Kata', 'Kumite', 'Kihon', 'Conditioning'].map(type => (
               <MenuItem key={type} value={type}>
                  {type}
               </MenuItem>
            ))}
         </TextField>
         <TextField 
             label='Duration (minutes)' 
             type='number' 
             value={formData.duration} 
             onChange={handleChange('duration')} 
             fullWidth 
             required 
             sx={{mb: 2}} 
             InputProps={{ inputProps: { step: 15 } }}
             helperText={formatDuration(formData.duration)}
         />
         <TextField label='Intensity' select value={formData.intensity} onChange={handleChange('intensity')} fullWidth required sx={{mb: 2}}>
            {['Light', 'Moderate', 'Intense'].map(level => (
               <MenuItem key={level} value={level}>
                  {level}
               </MenuItem>
            ))}
         </TextField>
         <TextField label='Notes' multiline rows={4} value={formData.notes} onChange={handleChange('notes')} fullWidth sx={{mb: 2}} />
         <Button type='submit' variant='contained' color='primary' fullWidth>
            {isEditMode ? 'Update Session' : 'Add Session'}
         </Button>
      </Box>
   );
};

export default TrainingSessionForm;
