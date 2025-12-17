// File: ./src/app/Technique/KarateTimeline.tsx

import AddIcon from '@mui/icons-material/Add';
import ChatIcon from '@mui/icons-material/Chat';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FavoriteIcon from '@mui/icons-material/Favorite';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import WarningIcon from '@mui/icons-material/Warning';
import Timeline from '@mui/lab/Timeline';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Rating from '@mui/material/Rating';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import {useTheme} from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import React from 'react';

import {GetFlagEmoji, useLanguage} from '@/components/context/LanguageContext'; // Import the hook
import { useSnackbar } from '@/components/context/SnackbarContext';
import CustomDivider from '@/components/UI/CustomDivider';
import KarateBelt from '@/components/UI/KarateBelt';
import {getLocalStorageItem, setLocalStorageItem} from '@/components/utils/localStorageUtils';
import {gradeData} from '@/data/gradeData';

import kyokushinRanks from '../../data/kyokushinRanks';
import {GetTechniqueByType, TechniqueTypeEnumValues} from './TechniqueData';

const suggestedTags = [
   {label: 'favorite', icon: FavoriteIcon, color: 'error' as const},
   {label: 'difficult', icon: WarningIcon, color: 'warning' as const},
   {label: 'mastered', icon: ThumbUpIcon, color: 'success' as const},
   {label: 'practice', icon: PlayArrowIcon, color: 'info' as const},
   {label: 'review', icon: RemoveRedEyeIcon, color: 'secondary' as const},
];

const getTagConfig = (tag: string) => {
   return suggestedTags.find(t => t.label === tag) || {label: tag, icon: null, color: 'default' as const};
};

const toTitleCase = (str: string) => {
   return str.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
};

const getYoutubeEmbedUrl = (url: string) => {
   const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
   return match ? `https://www.youtube.com/embed/${match[1]}` : null;
};

interface KarateTimelineProps {
   searchTerm: string;
   ratings: Record<string, number>;
   setRatings: React.Dispatch<React.SetStateAction<Record<string, number>>>;
   notes: Record<string, string>;
   setNotes: React.Dispatch<React.SetStateAction<Record<string, string>>>;
   tags: Record<string, string[]>;
   setTags: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
   youtubeLinks: Record<string, string[]>;
   setYoutubeLinks: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
   selectedType: string | null;
}

export default React.memo(function KarateTimeline({searchTerm, selectedType, ratings, setRatings, notes, setNotes, tags, setTags, youtubeLinks, setYoutubeLinks}: KarateTimelineProps) {
   const theme = useTheme();
   // Use the useLanguage hook to get selectedLanguages
   const {selectedLanguages} = useLanguage();

   const [editModes, setEditModes] = React.useState<Record<string, boolean>>({});
   const [selectedImage, setSelectedImage] = React.useState<string | null>(null);

   const [selectedTagFilter, setSelectedTagFilter] = React.useState('');
   const [minRatingFilter, setMinRatingFilter] = React.useState(0);
   const [hasNotesFilter, setHasNotesFilter] = React.useState(false);

   const { showSnackbar } = useSnackbar();

   const handleFlagClick = (text: string) => {
      navigator.clipboard.writeText(text);
      showSnackbar(`Copied: ${text}`, 'success');
   };


   const handleRatingChange = (techniqueId: string, newRating: number | null) => {
      const updated = {...ratings, [techniqueId]: newRating || 0};
      setRatings(updated);
      setLocalStorageItem('techniqueRatings', updated);
   };

   const handleAddTag = (techniqueId: string, tag: string) => {
      if (!tag.trim()) return;
      const currentTags = tags[techniqueId] || [];
      if (!currentTags.includes(tag)) {
         const updated = {...tags, [techniqueId]: [...currentTags, tag]};
         setTags(updated);
         setLocalStorageItem('techniqueTags', updated);
      }
   };

   const handleRemoveTag = (techniqueId: string, tagToRemove: string) => {
      const currentTags = tags[techniqueId] || [];
      const updated = {...tags, [techniqueId]: currentTags.filter(tag => tag !== tagToRemove)};
      setTags(updated);
      setLocalStorageItem('techniqueTags', updated);
   };

   const filteredGrades = React.useMemo(() => {
      return gradeData
         .map(grade => ({
            ...grade,
            techniques: grade.techniques.filter(technique => {
               const romaji = technique.romaji.toLowerCase();
               const matchesSearch =
                  !searchTerm ||
                  romaji.includes(searchTerm.toLowerCase()) ||
                  (technique.japanese || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                  (technique.english || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                  (technique.swedish || '').toLowerCase().includes(searchTerm.toLowerCase());

               const matchesTag = !selectedTagFilter || (tags[technique.romaji] || []).includes(selectedTagFilter);

               const matchesRating = (ratings[technique.romaji] || 0) >= minRatingFilter;

               const matchesNotes = !hasNotesFilter || notes[technique.romaji];

               const matchesType = !selectedType || technique.type === selectedType;

               return matchesSearch && matchesTag && matchesRating && matchesNotes && matchesType;
            }),
            katas: grade.katas.filter(kata => {
               const romaji = kata.romaji.toLowerCase();
               const matchesSearch =
                  !searchTerm ||
                  romaji.includes(searchTerm.toLowerCase()) ||
                  (kata.japanese || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                  (kata.english || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                  (kata.swedish || '').toLowerCase().includes(searchTerm.toLowerCase());

               const matchesTag = !selectedTagFilter || (tags[kata.romaji] || []).includes(selectedTagFilter);

               const matchesRating = (ratings[kata.romaji] || 0) >= minRatingFilter;

               const matchesNotes = !hasNotesFilter || notes[kata.romaji];

               const matchesType = !selectedType || selectedType === 'Kata';

               return matchesSearch && matchesTag && matchesRating && matchesNotes && matchesType;
            }),
         }))
         .filter(grade => grade.techniques.length > 0 || grade.katas.length > 0);
   }, [searchTerm, selectedType, selectedTagFilter, minRatingFilter, hasNotesFilter, tags, ratings, notes]);

   const allTags = React.useMemo(() => {
      const tagSet = new Set<string>();
      Object.values(tags).forEach(tagArray => tagArray.forEach(tag => tagSet.add(tag)));
      return Array.from(tagSet).sort();
   }, [tags]);

   return (
      <>
         <Box sx={{mt: 2, mb: 2}}>
            <Stack direction={{xs: 'column', sm: 'row'}} spacing={2} sx={{mb: 2, ml: 2}}>
               <FormControl size='small' sx={{minWidth: 150}}>
                  <InputLabel>Filter by Tag</InputLabel>
                  <Select value={selectedTagFilter} onChange={e => setSelectedTagFilter(e.target.value)} label='Filter by Tag'>
                     <MenuItem value=''>
                        <em>All</em>
                     </MenuItem>
                     {allTags.map(tag => (
                        <MenuItem key={tag} value={tag}>
                           {toTitleCase(tag)}
                        </MenuItem>
                     ))}
                  </Select>
               </FormControl>
               <FormControl size='small' sx={{minWidth: 150}}>
                  <InputLabel>Min Rating</InputLabel>
                  <Select value={minRatingFilter} onChange={e => setMinRatingFilter(Number(e.target.value))} label='Min Rating'>
                     <MenuItem value={0}>Any</MenuItem>
                     <MenuItem value={1}>1+</MenuItem>
                     <MenuItem value={2}>2+</MenuItem>
                     <MenuItem value={3}>3+</MenuItem>
                     <MenuItem value={4}>4+</MenuItem>
                     <MenuItem value={5}>5</MenuItem>
                  </Select>
               </FormControl>
               <FormControl size='small'>
                  <InputLabel>Has Notes</InputLabel>
                  <Select value={hasNotesFilter ? 'yes' : 'no'} onChange={e => setHasNotesFilter(e.target.value === 'yes')} label='Has Notes'>
                     <MenuItem value='no'>Any</MenuItem>
                     <MenuItem value='yes'>With Notes</MenuItem>
                  </Select>
               </FormControl>
            </Stack>
         </Box>
         <Timeline
            position='right'
            sx={{
               width: '100%',
               [`& .MuiTimelineItem-root::before`]: {
                  flex: 0,
               },
               pl: 0,
               ml: 0,
               mt: 2,
               p: 0,
            }}>
            {filteredGrades.map((grade, index) => {
               const connectorColor = theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.common.black;
               const boxShadowColor = theme.palette.mode === 'dark' ? theme.palette.grey[500] : theme.palette.grey[300];
               const beltConnectorColor = kyokushinRanks[grade.rankName].beltColor;

               return (
                  <TimelineItem key={index} sx={{m: 0, p: 0}}>
                     <TimelineSeparator
                        sx={{
                           flexDirection: 'column',
                           alignItems: 'center',
                           minWidth: theme.spacing(6),
                        }}>
                        <KarateBelt
                           sx={{
                              width: theme.spacing(4),
                              height: theme.spacing(4),
                              boxShadow: `0.2em 0.2em 0.3em ${boxShadowColor}`,
                           }}
                           color={grade.beltColor}
                           thickness={'0.3em'}
                           stripes={kyokushinRanks[grade.rankName].beltStripe}
                           borderRadius='100%'
                        />
                        {index < filteredGrades.length - 1 && (
                           <TimelineConnector
                              sx={{
                                 width: theme.spacing(0.5),
                                 backgroundColor: beltConnectorColor,
                                 borderColor: connectorColor,
                                 boxShadow: `0.2em 0.2em 0.3em ${boxShadowColor}`,
                              }}
                           />
                        )}
                     </TimelineSeparator>
                     <TimelineContent>
                        <Typography
                           variant='h6'
                           component='div'
                           color='text.primary'
                           sx={{
                              fontSize: {
                                 xs: '1rem',
                                 sm: '1.25rem',
                                 md: '1.5rem',
                              },
                              cursor: 'default',
                              whiteSpace: 'normal', // Ensure content wraps
                           }}>
                           {grade.rankName} - {kyokushinRanks[grade.rankName].beltName}
                        </Typography>
                        {TechniqueTypeEnumValues.map(type => {
                           const items =
                              grade.techniques
                                 .filter(t => t.type === type)
                                 .map(t => ({
                                    levelNumber: grade.kyuNumber,
                                    romaji: t.romaji,
                                    japanese: t.japanese,
                                    english: t.english,
                                    swedish: t.swedish,
                                    type: type,
                                    youtubeKey: t.youtubeKey,
                                 })) || [];
                           // If there are no items for the current type, return null.
                           // This will prevent rendering an empty section like white belt.
                           if (items.length === 0) return null;

                           return (
                              // Render Technique Type
                              <React.Fragment key={`${type}-${type}`}>
                                 <Stack
                                    direction='column'
                                    sx={{
                                       width: '100%',
                                       mt: 1,
                                    }}>
                                    <CustomDivider textAlign='start' thickness={2}>
                                       <Typography variant='h6' component='span' color='text.primary'>
                                          {type.toUpperCase()}
                                       </Typography>
                                    </CustomDivider>
                                 </Stack>
                                 <Box sx={{width: '100%'}}>
                                    {items.map(technique => (
                                       <Accordion key={technique.romaji} sx={{mb: 1}}>
                                          <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%'}}>
                                             <Stack spacing={0} direction='column' sx={{flexGrow: 1, alignItems: 'flex-start'}}>
                                                {selectedLanguages.map(
                                                   language =>
                                                      technique[language] && (
                                                         <Typography
                                                            key={language}
                                                            align='left'
                                                            variant='body2'
                                                            color='main'
                                                            sx={{
                                                               whiteSpace: 'normal',
                                                               wordBreak: 'break-word',
                                                            }}>
                                                            <span
                                                               onClick={(e) => {
                                                                  e.stopPropagation();
                                                                  handleFlagClick(technique[language] || '');
                                                               }}
                                                               style={{ cursor: 'pointer', marginRight: '4px' }}
                                                            >
                                                               {GetFlagEmoji(language)}
                                                            </span>
                                                            {technique[language] || 'Translation not available'}
                                                         </Typography>
                                                      ),
                                                )}
                                             </Stack>
                                             <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5}}>
                                                <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5}}>
                                                   {notes[technique.romaji] && <ChatIcon fontSize='small' />}
                                                   <Rating value={ratings[technique.romaji] || 0} readOnly size='small' />
                                                </Box>
                                                {(tags[technique.romaji] || []).length > 0 && (
                                                   <Stack direction='row' spacing={0.5} sx={{flexWrap: 'wrap', justifyContent: 'flex-end'}}>
                                                      {(tags[technique.romaji] || []).slice(0, 3).map(tag => {
                                                         const config = getTagConfig(tag);
                                                         const Icon = config.icon;
                                                         return <Chip key={tag} label={toTitleCase(tag)} icon={Icon ? <Icon sx={{fontSize: '0.7rem'}} /> : undefined} size='small' color={config.color} variant='filled' sx={{fontSize: '0.7rem', height: '20px'}} />;
                                                      })}
                                                   </Stack>
                                                )}
                                             </Box>
                                          </AccordionSummary>
                                          <AccordionDetails>
                                             <Box sx={{display: 'flex', justifyContent: 'flex-end', mb: 1}}>
                                                <IconButton size='small' onClick={() => setEditModes(prev => ({...prev, [technique.romaji]: !prev[technique.romaji]}))}>
                                                   <EditIcon />
                                                </IconButton>
                                             </Box>
                                             <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                                                {editModes[technique.romaji] && (
                                                   <Box>
                                                      <Typography variant='body2'>Rating:</Typography>
                                                      <Rating value={ratings[technique.romaji] || 0} onChange={(event, newValue) => handleRatingChange(technique.romaji, newValue)} />
                                                   </Box>
                                                )}
                                                {editModes[technique.romaji] ? (
                                                   <TextField
                                                      label='Notes'
                                                      multiline
                                                      rows={4}
                                                      defaultValue={notes[technique.romaji] || ''}
                                                      onBlur={e => {
                                                         const newNote = e.target.value;
                                                         setNotes(prev => ({...prev, [technique.romaji]: newNote}));
                                                         setLocalStorageItem('techniqueNotes', {...notes, [technique.romaji]: newNote});
                                                      }}
                                                      fullWidth
                                                   />
                                                ) : (
                                                   notes[technique.romaji] && (
                                                      <Box>
                                                         <Typography variant='body2'>Notes:</Typography>
                                                         <Typography variant='body1' sx={{mt: 0.5, whiteSpace: 'pre-wrap'}}>
                                                            {notes[technique.romaji]}
                                                         </Typography>
                                                      </Box>
                                                   )
                                                )}
                                                 {(() => {
                                                    const defaultLink = technique.youtubeKey ? [`https://www.youtube.com/watch?v=${technique.youtubeKey}`] : [];
                                                    const userLinks = youtubeLinks[technique.romaji] || [];
                                                    const allLinks = [...defaultLink, ...userLinks];
                                                    const hasMedia = allLinks.length > 0;

                                                    return (
                                                       (editModes[technique.romaji] || hasMedia) && (
                                                          <Box sx={{mt: 1}}>
                                                             <Typography variant='body2' sx={{mb: 1}}>
                                                                Media:
                                                             </Typography>
                                                             {editModes[technique.romaji] && (
                                                                <Stack spacing={1}>
                                                                   {userLinks.map((url, index) => (
                                                                      <Box key={index} sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                                                         <TextField
                                                                            label={`Media ${index + 1}`}
                                                                            size='small'
                                                                            defaultValue={url}
                                                                            onBlur={e => {
                                                                               const newUrl = e.target.value.trim();
                                                                               const currentUrls = youtubeLinks[technique.romaji] || [];
                                                                               const updatedUrls = [...currentUrls];
                                                                               updatedUrls[index] = newUrl;
                                                                               const filteredUrls = updatedUrls.filter(u => u);
                                                                               setYoutubeLinks(prev => ({...prev, [technique.romaji]: filteredUrls}));
                                                                               setLocalStorageItem('techniqueYoutubeLinks', {...youtubeLinks, [technique.romaji]: filteredUrls});
                                                                            }}
                                                                            fullWidth
                                                                         />
                                                                         <IconButton
                                                                            size='small'
                                                                            onClick={() => {
                                                                               const currentUrls = youtubeLinks[technique.romaji] || [];
                                                                               const updatedUrls = currentUrls.filter((_, i) => i !== index);
                                                                               setYoutubeLinks(prev => ({...prev, [technique.romaji]: updatedUrls}));
                                                                               setLocalStorageItem('techniqueYoutubeLinks', {...youtubeLinks, [technique.romaji]: updatedUrls});
                                                                            }}>
                                                                            <DeleteIcon />
                                                                         </IconButton>
                                                                      </Box>
                                                                   ))}
                                                                   <IconButton
                                                                      size='small'
                                                                      onClick={() => {
                                                                         const currentUrls = youtubeLinks[technique.romaji] || [];
                                                                         const updatedUrls = [...currentUrls, ''];
                                                                         setYoutubeLinks(prev => ({...prev, [technique.romaji]: updatedUrls}));
                                                                         setLocalStorageItem('techniqueYoutubeLinks', {...youtubeLinks, [technique.romaji]: updatedUrls});
                                                                      }}
                                                                      sx={{alignSelf: 'flex-start'}}>
                                                                      <AddIcon />
                                                                   </IconButton>
                                                                </Stack>
                                                             )}
                                                             {hasMedia && (
                                                                <Box sx={{mt: 2}}>
                                                                   <Typography variant='body2' sx={{mb: 1}}>
                                                                      Media Previews:
                                                                   </Typography>
                                                                   <Stack direction='row' spacing={3} sx={{flexWrap: 'wrap', alignItems: 'flex-start'}}>
                                                                      {allLinks.map((url, index) => {
                                                                         const embedUrl = getYoutubeEmbedUrl(url);
                                                                         if (embedUrl) {
                                                                            return (
                                                                               <iframe
                                                                                  key={index}
                                                                                  width='240'
                                                                                  height='135'
                                                                                  src={embedUrl}
                                                                                  title={`YouTube video player ${index + 1}`}
                                                                                  frameBorder='0'
                                                                                  allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                                                                                  allowFullScreen
                                                                                  style={{maxWidth: '100%'}}></iframe>
                                                                            );
                                                                         } else {
                                                                            return <img key={index} src={url} alt={`Media ${index + 1}`} style={{width: '240px', height: '135px', cursor: 'pointer', objectFit: 'contain'}} onClick={() => setSelectedImage(url)} />;
                                                                         }
                                                                      })}
                                                                   </Stack>
                                                                </Box>
                                                             )}
                                                          </Box>
                                                       )
                                                    );
                                                 })()}
                                                {editModes[technique.romaji] && (
                                                   <Box>
                                                      <Typography variant='body2' sx={{mb: 1}}>
                                                         Tags:
                                                      </Typography>
                                                      <Box sx={{mb: 2}}>
                                                         <Typography variant='caption' color='text.secondary' sx={{mb: 0.5}}>
                                                            Suggested:
                                                         </Typography>
                                                         <Stack direction='row' spacing={1} sx={{flexWrap: 'wrap'}}>
                                                            {suggestedTags.map(({label, icon: Icon, color}) => (
                                                               <Chip key={label} label={toTitleCase(label)} icon={<Icon />} onClick={() => handleAddTag(technique.romaji, label)} size='small' color={color} variant='filled' />
                                                            ))}
                                                         </Stack>
                                                      </Box>
                                                      <TextField
                                                         label='Add Custom Tag'
                                                         size='small'
                                                         onKeyDown={e => {
                                                            if (e.key === 'Enter') {
                                                               handleAddTag(technique.romaji, (e.target as HTMLInputElement).value);
                                                               (e.target as HTMLInputElement).value = '';
                                                            }
                                                         }}
                                                         fullWidth
                                                         sx={{mb: 1}}
                                                      />
                                                      {(tags[technique.romaji] || []).length > 0 && (
                                                         <Box>
                                                            <Typography variant='caption' color='text.secondary' sx={{mb: 0.5}}>
                                                               Your Tags:
                                                            </Typography>
                                                            <Stack direction='row' spacing={1} sx={{flexWrap: 'wrap'}}>
                                                               {(tags[technique.romaji] || []).map(tag => (
                                                                  <Chip key={tag} label={toTitleCase(tag)} onDelete={() => handleRemoveTag(technique.romaji, tag)} size='small' />
                                                               ))}
                                                            </Stack>
                                                         </Box>
                                                      )}
                                                   </Box>
                                                )}
                                             </Box>
                                          </AccordionDetails>
                                       </Accordion>
                                    ))}
                                 </Box>
                              </React.Fragment>
                           );
                        })}
                        {grade.katas.length > 0 && (
                           <>
                              <Stack
                                 direction='column'
                                 sx={{
                                    width: '100%',
                                    mt: 1,
                                 }}>
                                 <CustomDivider textAlign='start' thickness={2}>
                                    <Typography variant='h6' component='span' color='text.primary'>
                                       KATA
                                    </Typography>
                                 </CustomDivider>
                              </Stack>
                              <Box sx={{width: '100%'}}>
                                 {grade.katas.map(kata => (
                                    <Accordion key={kata.id} sx={{mb: 1}}>
                                       <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%'}}>
                                          <Stack spacing={0} direction='column' sx={{flexGrow: 1, alignItems: 'flex-start'}}>
                                             {selectedLanguages.map(
                                                language =>
                                                   kata[language] && (
                                                      <Typography
                                                         key={language}
                                                         align='left'
                                                         variant='body2'
                                                         color='main'
                                                         sx={{
                                                            whiteSpace: 'normal',
                                                            wordBreak: 'break-word',
                                                         }}>
                                                         <span
                                                            onClick={(e) => {
                                                               e.stopPropagation();
                                                               handleFlagClick(kata[language] || '');
                                                            }}
                                                            style={{ cursor: 'pointer', marginRight: '4px' }}
                                                         >
                                                            {GetFlagEmoji(language)}
                                                         </span>
                                                         {kata[language] || 'Translation not available'}
                                                      </Typography>
                                                   ),
                                             )}
                                          </Stack>
                                          <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5}}>
                                             <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5}}>
                                                {notes[kata.romaji] && <ChatIcon fontSize='small' />}
                                                <Rating value={ratings[kata.romaji] || 0} readOnly size='small' />
                                             </Box>
                                             {(tags[kata.romaji] || []).length > 0 && (
                                                <Stack direction='row' spacing={0.5} sx={{flexWrap: 'wrap', justifyContent: 'flex-end'}}>
                                                   {(tags[kata.romaji] || []).slice(0, 3).map(tag => {
                                                      const config = getTagConfig(tag);
                                                      const Icon = config.icon;
                                                      return <Chip key={tag} label={toTitleCase(tag)} icon={Icon ? <Icon sx={{fontSize: '0.7rem'}} /> : undefined} size='small' color={config.color} variant='filled' sx={{fontSize: '0.7rem', height: '20px'}} />;
                                                   })}
                                                </Stack>
                                             )}
                                          </Box>
                                       </AccordionSummary>
                                       <AccordionDetails>
                                          <Box sx={{display: 'flex', justifyContent: 'flex-end', mb: 1}}>
                                             <IconButton size='small' onClick={() => setEditModes(prev => ({...prev, [kata.romaji]: !prev[kata.romaji]}))}>
                                                <EditIcon />
                                             </IconButton>
                                          </Box>
                                          <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                                             <Typography variant='body1' sx={{whiteSpace: 'pre-wrap'}}>
                                                {kata.detailedDescription}
                                             </Typography>
                                             {editModes[kata.romaji] && (
                                                <Box>
                                                   <Typography variant='body2'>Rating:</Typography>
                                                   <Rating value={ratings[kata.romaji] || 0} onChange={(event, newValue) => handleRatingChange(kata.romaji, newValue)} />
                                                </Box>
                                             )}
                                             {editModes[kata.romaji] ? (
                                                <TextField
                                                   label='Notes'
                                                   multiline
                                                   rows={4}
                                                   defaultValue={notes[kata.romaji] || ''}
                                                   onBlur={e => {
                                                      const newNote = e.target.value;
                                                      setNotes(prev => ({...prev, [kata.romaji]: newNote}));
                                                      setLocalStorageItem('techniqueNotes', {...notes, [kata.romaji]: newNote});
                                                   }}
                                                   fullWidth
                                                />
                                             ) : (
                                                notes[kata.romaji] && (
                                                   <Box>
                                                      <Typography variant='body2'>Notes:</Typography>
                                                      <Typography variant='body1' sx={{mt: 0.5, whiteSpace: 'pre-wrap'}}>
                                                         {notes[kata.romaji]}
                                                      </Typography>
                                                   </Box>
                                                )
                                             )}
                                              {(() => {
                                                 const defaultLink = kata.youtubeKey ? [`https://www.youtube.com/watch?v=${kata.youtubeKey}`] : [];
                                                 const userLinks = youtubeLinks[kata.romaji] || [];
                                                 const allLinks = [...defaultLink, ...userLinks];
                                                 const hasMedia = allLinks.length > 0;

                                                 return (
                                                    (editModes[kata.romaji] || hasMedia) && (
                                                       <Box sx={{mt: 1}}>
                                                          <Typography variant='body2' sx={{mb: 1}}>
                                                             Media:
                                                          </Typography>
                                                          {editModes[kata.romaji] && (
                                                             <Stack spacing={1}>
                                                                {userLinks.map((url, index) => (
                                                                   <Box key={index} sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                                                      <TextField
                                                                         label={`Media ${index + 1}`}
                                                                         size='small'
                                                                         defaultValue={url}
                                                                         onBlur={e => {
                                                                            const newUrl = e.target.value.trim();
                                                                            const currentUrls = youtubeLinks[kata.romaji] || [];
                                                                            const updatedUrls = [...currentUrls];
                                                                            updatedUrls[index] = newUrl;
                                                                            const filteredUrls = updatedUrls.filter(u => u);
                                                                            setYoutubeLinks(prev => ({...prev, [kata.romaji]: filteredUrls}));
                                                                            setLocalStorageItem('techniqueYoutubeLinks', {...youtubeLinks, [kata.romaji]: filteredUrls});
                                                                         }}
                                                                         fullWidth
                                                                      />
                                                                      <IconButton
                                                                         size='small'
                                                                         onClick={() => {
                                                                            const currentUrls = youtubeLinks[kata.romaji] || [];
                                                                            const updatedUrls = currentUrls.filter((_, i) => i !== index);
                                                                            setYoutubeLinks(prev => ({...prev, [kata.romaji]: updatedUrls}));
                                                                            setLocalStorageItem('techniqueYoutubeLinks', {...youtubeLinks, [kata.romaji]: updatedUrls});
                                                                         }}>
                                                                         <DeleteIcon />
                                                                      </IconButton>
                                                                   </Box>
                                                                ))}
                                                                <IconButton
                                                                   size='small'
                                                                   onClick={() => {
                                                                      const currentUrls = youtubeLinks[kata.romaji] || [];
                                                                      const updatedUrls = [...currentUrls, ''];
                                                                      setYoutubeLinks(prev => ({...prev, [kata.romaji]: updatedUrls}));
                                                                      setLocalStorageItem('techniqueYoutubeLinks', {...youtubeLinks, [kata.romaji]: updatedUrls});
                                                                   }}
                                                                   sx={{alignSelf: 'flex-start'}}>
                                                                   <AddIcon />
                                                                </IconButton>
                                                             </Stack>
                                                          )}
                                                          {hasMedia && (
                                                             <Box sx={{mt: 2}}>
                                                                <Typography variant='body2' sx={{mb: 1}}>
                                                                   Media Previews:
                                                                </Typography>
                                                                <Stack direction='row' spacing={3} sx={{flexWrap: 'wrap', alignItems: 'flex-start'}}>
                                                                   {allLinks.map((url, index) => {
                                                                      const embedUrl = getYoutubeEmbedUrl(url);
                                                                      if (embedUrl) {
                                                                         return (
                                                                            <iframe
                                                                               key={index}
                                                                               width='240'
                                                                               height='135'
                                                                               src={embedUrl}
                                                                               title={`YouTube video player ${index + 1}`}
                                                                               frameBorder='0'
                                                                               allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                                                                               allowFullScreen
                                                                               style={{maxWidth: '100%'}}></iframe>
                                                                         );
                                                                      } else {
                                                                         return <img key={index} src={url} alt={`Media ${index + 1}`} style={{width: '240px', height: '135px', cursor: 'pointer', objectFit: 'contain'}} onClick={() => setSelectedImage(url)} />;
                                                                      }
                                                                   })}
                                                                </Stack>
                                                             </Box>
                                                          )}
                                                       </Box>
                                                    )
                                                 );
                                              })()}
                                             {editModes[kata.romaji] && (
                                                <Box>
                                                   <Typography variant='body2' sx={{mb: 1}}>
                                                      Tags:
                                                   </Typography>
                                                   <Box sx={{mb: 2}}>
                                                      <Typography variant='caption' color='text.secondary' sx={{mb: 0.5}}>
                                                         Suggested:
                                                      </Typography>
                                                      <Stack direction='row' spacing={1} sx={{flexWrap: 'wrap'}}>
                                                         {suggestedTags.map(({label, icon: Icon, color}) => (
                                                            <Chip key={label} label={toTitleCase(label)} icon={<Icon />} onClick={() => handleAddTag(kata.romaji, label)} size='small' color={color} variant='filled' />
                                                         ))}
                                                      </Stack>
                                                   </Box>
                                                   <TextField
                                                      label='Add Custom Tag'
                                                      size='small'
                                                      onKeyDown={e => {
                                                         if (e.key === 'Enter') {
                                                            handleAddTag(kata.romaji, (e.target as HTMLInputElement).value);
                                                            (e.target as HTMLInputElement).value = '';
                                                         }
                                                      }}
                                                      fullWidth
                                                      sx={{mb: 1}}
                                                   />
                                                   {(tags[kata.romaji] || []).length > 0 && (
                                                      <Box>
                                                         <Typography variant='caption' color='text.secondary' sx={{mb: 0.5}}>
                                                            Your Tags:
                                                         </Typography>
                                                         <Stack direction='row' spacing={1} sx={{flexWrap: 'wrap'}}>
                                                            {(tags[kata.romaji] || []).map(tag => (
                                                               <Chip key={tag} label={toTitleCase(tag)} onDelete={() => handleRemoveTag(kata.romaji, tag)} size='small' />
                                                            ))}
                                                         </Stack>
                                                      </Box>
                                                   )}
                                                </Box>
                                             )}
                                          </Box>
                                       </AccordionDetails>
                                    </Accordion>
                                 ))}
                              </Box>
                           </>
                        )}
                     </TimelineContent>
                  </TimelineItem>
               );
            })}
         </Timeline>
         <Dialog open={!!selectedImage} onClose={() => setSelectedImage(null)} maxWidth='lg'>
            <DialogContent>{selectedImage && <img src={selectedImage} style={{maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain'}} />}</DialogContent>
         </Dialog>
      </>
   );
});
