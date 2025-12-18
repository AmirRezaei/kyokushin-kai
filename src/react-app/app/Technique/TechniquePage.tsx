
import DownloadIcon from '@mui/icons-material/Download';
import SearchIcon from '@mui/icons-material/Search';
import UploadIcon from '@mui/icons-material/Upload';
import {Box, Button, Chip, InputAdornment, Stack, TextField} from '@mui/material';
import React, {useState, useEffect} from 'react';

import { KyokushinRepository, GradeWithContent } from '../../../data/repo/KyokushinRepository';
import { useAuth } from '@/components/context/AuthContext';
import { useSnackbar } from '@/components/context/SnackbarContext';

import KarateTimeline from './KarateTimeline';

const TechniquePage: React.FC = () => {
     const [searchTerm, setSearchTerm] = useState('');
     const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
     const [selectedType, setSelectedType] = useState<string | null>(null);

     const [grades, setGrades] = useState<GradeWithContent[]>([]);
     const [loading, setLoading] = useState(true);

     const [ratings, setRatings] = useState<Record<string, number>>({});
     const [notes, setNotes] = useState<Record<string, string>>({});
     const [tags, setTags] = useState<Record<string, string[]>>({});
     const [youtubeLinks, setYoutubeLinks] = useState<Record<string, string[]>>({});

     const { token } = useAuth();
     const { showSnackbar } = useSnackbar();

     useEffect(() => {
        // Fetch data from repository
        const data = KyokushinRepository.getCurriculumGrades();
        setGrades(data);
        setLoading(false);
     }, []);

     React.useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearchTerm(searchTerm), 300);
        return () => clearTimeout(timer);
     }, [searchTerm]);

     // Fetch user progress on mount or when token changes
     useEffect(() => {
        if (!token) return;

        fetch('/api/v1/technique-progress', {
           headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => {
           if (res.ok) return res.json();
           throw new Error('Failed to fetch progress');
        })
        .then((data: any) => {
           if (data.progress) {
             const newRatings: Record<string, number> = {};
             const newNotes: Record<string, string> = {};
             const newTags: Record<string, string[]> = {};
             const newYoutubeLinks: Record<string, string[]> = {};

             data.progress.forEach((item: any) => {
                if (item.rating) newRatings[item.techniqueId] = item.rating;
                if (item.notes) newNotes[item.techniqueId] = item.notes;
                if (item.tags && item.tags.length) newTags[item.techniqueId] = item.tags;
                if (item.videoLinks && item.videoLinks.length) newYoutubeLinks[item.techniqueId] = item.videoLinks;
             });

             setRatings(newRatings);
             setNotes(newNotes);
             setTags(newTags);
             setYoutubeLinks(newYoutubeLinks);
           }
        })
        .catch(err => console.error('Error fetching progress:', err));
     }, [token]);

     const onSaveProgress = async (techniqueId: string, data: { rating?: number; notes?: string; tags?: string[]; videoLinks?: string[] }) => {
        if (!token) {
           showSnackbar('Please log in to save progress', 'warning');
           return;
        }

        try {
           const res = await fetch('/api/v1/technique-progress', {
              method: 'POST',
              headers: { 
                 'Content-Type': 'application/json',
                 Authorization: `Bearer ${token}` 
              },
              body: JSON.stringify({ techniqueId, ...data })
           });

           if (!res.ok) {
              const err = await res.json();
              throw new Error(err.error || 'Failed to save');
           }
        } catch (error) {
           console.error('Save failed:', error);
           showSnackbar('Failed to save changes. Please try again.', 'error');
        }
     };

     const handleExport = () => {
        const data = {
           techniqueRatings: ratings,
           techniqueNotes: notes,
           techniqueTags: tags,
           techniqueYoutubeLinks: youtubeLinks,
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'technique-data.json';
        a.click();
        URL.revokeObjectURL(url);
     };

     const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
           const reader = new FileReader();
           reader.onload = (e) => {
              try {
                 const data = JSON.parse(e.target?.result as string);
                 if (data.techniqueRatings) setRatings(data.techniqueRatings);
                 if (data.techniqueNotes) setNotes(data.techniqueNotes);
                 if (data.techniqueTags) setTags(data.techniqueTags);
                 if (data.techniqueYoutubeLinks) setYoutubeLinks(data.techniqueYoutubeLinks);
                 
                 showSnackbar('Data imported locally. Edit items to save to cloud.', 'info');
              } catch (error) {
                 alert('Invalid JSON file');
              }
           };
           reader.readAsText(file);
        }
     };

    return (
       <Box>
          {/* Export/Import Buttons */}
          <Stack direction='row' spacing={1} sx={{mt: 2, mb: 2, ml: 2}}>
             <Button startIcon={<DownloadIcon />} onClick={handleExport} size='small'>Export</Button>
             <Button startIcon={<UploadIcon />} onClick={() => document.getElementById('import-file')?.click()} size='small'>Import</Button>
             <input id="import-file" type="file" accept=".json" onChange={handleImport} style={{display: 'none'}} />
          </Stack>
          
          <Box sx={{ mt: 2, mb: 2, ml: 2 }}>
             <TextField
                fullWidth
                label='Search Techniques'
                variant='outlined'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder='Search by Japanese, Romaji, Swedish or English'
                InputProps={{
                   startAdornment: (
                      <InputAdornment position='start'>
                         <SearchIcon />
                      </InputAdornment>
                   ),
                }}
             />
             <Stack key='technique-filters' direction='row' spacing={1} sx={{ mt: 1, flexWrap: 'wrap', gap: 1 }} useFlexGap>
                {['Dachi', 'Hiji Ate', 'Juji', 'Mawashi', 'Nukite','Seiken', 'Shotei', 'Shuto', 'Tettsui', 'Uchi', 'Uke', 'Uraken'].map((filter) => (
                   <Chip
                      key={filter}
                      label={filter}
                      onClick={() => setSearchTerm(searchTerm === filter ? '' : filter)}
                      color={searchTerm === filter ? 'primary' : 'default'}
                      variant={searchTerm === filter ? 'filled' : 'outlined'}
                   />
                ))}
             </Stack>
             <Stack key='type-filters' direction='row' spacing={1} sx={{ mt: 1, flexWrap: 'wrap', gap: 1 }} useFlexGap>
                {['Stand', 'Strike', 'Block', 'Kick', 'Kata', 'Fighting', 'Breathing'].map((type) => (
                   <Chip
                      key={type}
                      label={type}
                      onClick={() => setSelectedType(selectedType === type ? null : type)}
                      color={selectedType === type ? 'secondary' : 'default'}
                      variant={selectedType === type ? 'filled' : 'outlined'}
                   />
                ))}
             </Stack>
          </Box>
          <KarateTimeline 
             grades={grades} 
             loading={loading}
             searchTerm={debouncedSearchTerm} 
             selectedType={selectedType} 
             ratings={ratings} 
             setRatings={setRatings} 
             notes={notes} 
             setNotes={setNotes} 
             tags={tags} 
             setTags={setTags} 
             youtubeLinks={youtubeLinks} 
             setYoutubeLinks={setYoutubeLinks} 
             onSaveProgress={onSaveProgress}
          />
       </Box>
    );
};

export default TechniquePage;