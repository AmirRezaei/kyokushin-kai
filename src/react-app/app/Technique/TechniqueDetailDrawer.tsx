// TechniqueDetailDrawer.tsx - Bottom sheet for technique details
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Rating,
  TextField,
  Chip,
  Stack,
  Button,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { useState, useEffect } from 'react';

import { TechniqueRecord } from '../../../data/model/technique';
import { KataRecord } from '../../../data/model/kata';
import { PREDEFINED_TAGS, getTagConfig } from './tagConfig';

interface TechniqueDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  technique: TechniqueRecord | KataRecord | null;
  rating: number;
  notes: string;
  tags: string[];
  youtubeLinks: string[];
  onSave: (data: {
    rating?: number;
    notes?: string;
    tags?: string[];
    videoLinks?: string[];
  }) => void;
}

const TechniqueDetailDrawer: React.FC<TechniqueDetailDrawerProps> = ({
  open,
  onClose,
  technique,
  rating: initialRating,
  notes: initialNotes,
  tags: initialTags,
  youtubeLinks: initialYoutubeLinks,
  onSave,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [rating, setRating] = useState(initialRating);
  const [notes, setNotes] = useState(initialNotes);
  const [tags, setTags] = useState<string[]>(initialTags);
  const [newTag, setNewTag] = useState('');
  const [youtubeLinks, setYoutubeLinks] = useState<string[]>(initialYoutubeLinks);
  const [newLink, setNewLink] = useState('');
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false); // Start in view mode

  // Sync state with props when they change (important for videos loading async)
  useEffect(() => {
    setRating(initialRating);
  }, [initialRating]);

  useEffect(() => {
    setNotes(initialNotes);
  }, [initialNotes]);

  useEffect(() => {
    setTags(initialTags);
  }, [initialTags]);

  useEffect(() => {
    setYoutubeLinks(initialYoutubeLinks);
  }, [initialYoutubeLinks]);

  const handleSave = () => {
    onSave({
      rating,
      notes,
      tags,
      videoLinks: youtubeLinks,
    });
    onClose();
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleAddLink = () => {
    if (newLink.trim()) {
      // Extract YouTube ID if full URL
      const youtubeId = extractYouTubeId(newLink.trim());
      if (youtubeId && !youtubeLinks.includes(youtubeId)) {
        setYoutubeLinks([...youtubeLinks, youtubeId]);
        setNewLink('');
      }
    }
  };

  const handleRemoveLink = (linkToRemove: string) => {
    setYoutubeLinks(youtubeLinks.filter((l) => l !== linkToRemove));
  };

  const extractYouTubeId = (url: string): string => {
    // If it's already just an ID
    if (url.length === 11 && !url.includes('/') && !url.includes('.')) {
      return url;
    }

    // Extract from various YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) return match[1];
    }

    return url; // Return as-is if no pattern matches
  };

  if (!technique) return null;

  return (
    <Drawer
      key={technique?.id} // Force remount when technique changes to reset state
      anchor={isMobile ? 'bottom' : 'right'}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: isMobile ? '100%' : 400,
          maxHeight: isMobile ? '90vh' : '100vh',
          borderTopLeftRadius: isMobile ? 16 : 0,
          borderTopRightRadius: isMobile ? 16 : 0,
        },
      }}
    >
      <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {technique.name.romaji}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {technique.name.en}
            </Typography>
            {technique.name.ja && (
              <Typography variant="body2" color="text.secondary">
                {technique.name.ja}
              </Typography>
            )}
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Scrollable Content */}
        <Box sx={{ flex: 1, overflowY: 'auto', pr: 1 }}>
          {/* Rating */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Mastery Level
            </Typography>
            <Rating
              value={rating}
              onChange={isEditMode ? (_, newValue) => setRating(newValue || 0) : undefined}
              readOnly={!isEditMode}
              size="large"
              icon={<StarIcon fontSize="inherit" />}
              emptyIcon={<StarBorderIcon fontSize="inherit" />}
            />
          </Box>

          {/* Video Player */}
          {youtubeLinks.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Videos
              </Typography>
              {!showVideoPlayer ? (
                <Button
                  variant="outlined"
                  startIcon={<VideoLibraryIcon />}
                  onClick={() => setShowVideoPlayer(true)}
                  fullWidth
                  sx={{ minHeight: 48 }}
                >
                  Show Videos ({youtubeLinks.length})
                </Button>
              ) : (
                <Stack spacing={2}>
                  {youtubeLinks.map((videoUrl, index) => {
                    // Extract YouTube ID from URL (handles both full URLs and bare IDs)
                    const videoId = extractYouTubeId(videoUrl);

                    return (
                      <Box key={index}>
                        <Box
                          sx={{
                            position: 'relative',
                            paddingBottom: '56.25%', // 16:9 aspect ratio
                            height: 0,
                            overflow: 'hidden',
                          }}
                        >
                          <iframe
                            src={`https://www.youtube.com/embed/${videoId}`}
                            title={`Video ${index + 1}`}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              border: 'none',
                            }}
                          />
                        </Box>
                        <Button
                          size="small"
                          onClick={() => handleRemoveLink(videoUrl)}
                          sx={{ mt: 0.5 }}
                        >
                          Remove
                        </Button>
                      </Box>
                    );
                  })}
                  <Button variant="text" onClick={() => setShowVideoPlayer(false)}>
                    Hide Videos
                  </Button>
                </Stack>
              )}
            </Box>
          )}

          {/* Add Video Link - Only in Edit Mode */}
          {isEditMode && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Add Video Link
              </Typography>
              <Stack direction="row" spacing={1}>
                <TextField
                  size="small"
                  fullWidth
                  placeholder="YouTube URL or ID"
                  value={newLink}
                  onChange={(e) => setNewLink(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddLink();
                    }
                  }}
                />
                <Button
                  variant="outlined"
                  onClick={handleAddLink}
                  sx={{ minWidth: 44, minHeight: 44 }}
                >
                  Add
                </Button>
              </Stack>
            </Box>
          )}

          {/* Tags */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Tags
            </Typography>

            {/* Current Tags */}
            <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
              {tags.map((tag) => {
                const config = getTagConfig(tag);
                const TagIcon = config?.icon;

                return (
                  <Chip
                    key={tag}
                    label={tag}
                    icon={TagIcon ? <TagIcon /> : undefined}
                    onDelete={isEditMode ? () => handleRemoveTag(tag) : undefined}
                    size="small"
                    color={config?.color || 'default'}
                  />
                );
              })}
            </Stack>

            {/* Predefined Tag Suggestions - Only in Edit Mode */}
            {isEditMode && (
              <>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                    Quick add:
                  </Typography>
                  <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                    {Object.values(PREDEFINED_TAGS).map((tagConfig) => {
                      const isAdded = tags.includes(tagConfig.label);
                      const TagIcon = tagConfig.icon;

                      return (
                        <Chip
                          key={tagConfig.label}
                          label={tagConfig.label}
                          icon={<TagIcon />}
                          size="small"
                          variant={isAdded ? 'filled' : 'outlined'}
                          color={isAdded ? tagConfig.color : 'default'}
                          onClick={() => {
                            if (!isAdded) {
                              setTags([...tags, tagConfig.label]);
                            }
                          }}
                          sx={{
                            cursor: isAdded ? 'default' : 'pointer',
                            opacity: isAdded ? 0.6 : 1,
                          }}
                        />
                      );
                    })}
                  </Stack>
                </Box>

                {/* Custom Tag Input */}
                <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                  Or add custom tag:
                </Typography>
                <Stack direction="row" spacing={1}>
                  <TextField
                    size="small"
                    fullWidth
                    placeholder="Add custom tag"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                  />
                  <Button
                    variant="outlined"
                    onClick={handleAddTag}
                    sx={{ minWidth: 44, minHeight: 44 }}
                  >
                    Add
                  </Button>
                </Stack>
              </>
            )}
          </Box>

          {/* Notes */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Notes
            </Typography>
            {isEditMode ? (
              <TextField
                fullWidth
                multiline
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add your notes here..."
              />
            ) : (
              <Typography variant="body2" color={notes ? 'text.primary' : 'text.secondary'}>
                {notes || 'No notes yet'}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Footer Actions */}
        <Box sx={{ pt: 2, borderTop: 1, borderColor: 'divider' }}>
          {isEditMode ? (
            // Edit Mode: Cancel and Save
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                onClick={() => {
                  // Reset changes and go back to view mode
                  setRating(initialRating);
                  setNotes(initialNotes);
                  setTags(initialTags);
                  setYoutubeLinks(initialYoutubeLinks);
                  setIsEditMode(false);
                }}
                fullWidth
                sx={{ minHeight: 48 }}
              >
                Cancel
              </Button>
              <Button variant="contained" onClick={handleSave} fullWidth sx={{ minHeight: 48 }}>
                Save
              </Button>
            </Stack>
          ) : (
            // View Mode: Only Edit icon button (close X already in header)
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <IconButton
                onClick={() => setIsEditMode(true)}
                color="primary"
                size="large"
                sx={{
                  minWidth: 48,
                  minHeight: 48,
                }}
              >
                <EditIcon />
              </IconButton>
            </Box>
          )}
        </Box>
      </Box>
    </Drawer>
  );
};

export default TechniqueDetailDrawer;
