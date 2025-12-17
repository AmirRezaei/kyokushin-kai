// HEADER-START
// * Path: ./src/components/Kihon/ComboItemsList.tsx
// HEADER-END
import AddIcon from '@mui/icons-material/Add';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import StandIcon from '@mui/icons-material/DirectionsWalk';
import BlockIcon from '@mui/icons-material/EmojiPeople';
import PreviewIcon from '@mui/icons-material/Preview';
import KickIcon from '@mui/icons-material/SportsMartialArts';
import {Autocomplete, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Divider, IconButton, LinearProgress, TextField, Typography} from '@mui/material';
import React, {useCallback, useMemo, useState} from 'react';
import {v4 as uuidv4} from 'uuid';

import {FindGradeByTechniqueId, specialTechniqueTagsByCategory, Technique, TechniqueType} from '@/app/Technique/TechniqueData';
import {gradeData} from '@/data/gradeData';
import Uraken from '@/icons/uraken';

import DraggableList from '../UI/DraggableList/DraggableList';
import DraggableListItem from '../UI/DraggableList/DraggableListItem';
import DraggableListItemContent from '../UI/DraggableList/DraggableListItemContent';
import DraggableListItemContentAccordion from '../UI/DraggableList/DraggableListItemContentAccordion';
import KarateBelt from '../UI/KarateBelt';
import StrikeIcon from '../UI/StrikeIcon';
import {Combo, ComboItem, DividerItem, techniqueMap, TechniqueRef} from './KihonList';

interface ComboItemsListProps {
   // Combos currently filtered by difficulty & tags (for rendering)
   combos: Combo[];

   // The *entire* combos array, so we can mutate combos across the board
   allCombos: Combo[];
   setAllCombos: React.Dispatch<React.SetStateAction<Combo[]>>;

   // Props to open "Create or Edit Combo" dialog
   setAddTechniqueDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
   setSelectedComboIndexForAdding: React.Dispatch<React.SetStateAction<number | null>>;
   setComboNameInDialog: React.Dispatch<React.SetStateAction<string>>;
   setComboDifficultyInDialog: React.Dispatch<React.SetStateAction<'Beginner' | 'Intermediate' | 'Advanced'>>;
   setComboTagsInDialog: React.Dispatch<React.SetStateAction<string[]>>;
   setComboNotesInDialog: React.Dispatch<React.SetStateAction<string>>;

   // Props to open "Rename Combo" dialog
   setRenameDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
   setComboIndexToRename: React.Dispatch<React.SetStateAction<number | null>>;
}

const ComboItemsList: React.FC<ComboItemsListProps> = ({combos, allCombos, setAllCombos, setAddTechniqueDialogOpen, setSelectedComboIndexForAdding, setComboNameInDialog, setComboDifficultyInDialog, setComboTagsInDialog, setComboNotesInDialog, setRenameDialogOpen, setComboIndexToRename}) => {
   /* ------------------------------------------
      STATE for various local dialogs
  ------------------------------------------ */
   // Deletion
   const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
   const [deleteTarget, setDeleteTarget] = useState<{comboId: string; itemId?: string}>({
      comboId: '',
   });

   // Preview
   const [previewMode, setPreviewMode] = useState<boolean>(false);
   const [previewComboIndex, setPreviewComboIndex] = useState<number | null>(null);
   const [currentTechniqueIndex, setCurrentTechniqueIndex] = useState<number>(0);

   // Step divider
   const [addDividerDialogOpen, setAddDividerDialogOpen] = useState(false);
   const [dividerText, setDividerText] = useState('');
   const [targetComboIndexForDivider, setTargetComboIndexForDivider] = useState<number | null>(null);

   // "Technique tags" dialog
   const [techniqueTagsDialogOpen, setTechniqueTagsDialogOpen] = useState(false);
   const [techniqueTags, setTechniqueTags] = useState<string[]>([]);
   const [tagEditComboIndex, setTagEditComboIndex] = useState<number | null>(null);
   const [tagEditTechniqueIndex, setTagEditTechniqueIndex] = useState<number | null>(null);
   const [techniqueCategoryInDialog, setTechniqueCategoryInDialog] = useState<string>('');

   /* ------------------------------------------
      HANDLERS: Reordering
  ------------------------------------------ */
   const handleComboReorder = useCallback(
      (newOrder: {id: string}[]) => {
         // Map new order to actual combos
         const orderedCombos: Combo[] = [];
         newOrder.forEach(o => {
            const found = allCombos.find(c => c.id === o.id);
            if (found) orderedCombos.push(found);
         });
         setAllCombos(orderedCombos);
      },
      [allCombos, setAllCombos],
   );

   const handleComboItemsReorder = useCallback(
      (comboIndex: number, newOrder: {id: string}[]) => {
         const updated = [...allCombos];
         const combo = updated[comboIndex];
         if (!combo) return;
         const orderedItems: ComboItem[] = [];
         newOrder.forEach(o => {
            const found = combo.items.find(i => i.id === o.id);
            if (found) orderedItems.push(found);
         });
         combo.items = orderedItems;
         setAllCombos(updated);
      },
      [allCombos, setAllCombos],
   );

   /* ------------------------------------------
      HANDLERS: Deleting combos & items
  ------------------------------------------ */
   const openDeleteDialog = useCallback((comboId: string, itemId?: string) => {
      setDeleteTarget({comboId, itemId});
      setDeleteDialogOpen(true);
   }, []);

   const handleDeleteConfirmed = useCallback(() => {
      const updated = [...allCombos];
      if (!deleteTarget.itemId) {
         // delete entire combo
         const idx = updated.findIndex(c => c.id === deleteTarget.comboId);
         if (idx >= 0) {
            updated.splice(idx, 1);
         }
      } else {
         // delete combo item
         const comboIdx = updated.findIndex(c => c.id === deleteTarget.comboId);
         if (comboIdx >= 0) {
            const itemIndex = updated[comboIdx].items.findIndex(i => i.id === deleteTarget.itemId);
            if (itemIndex >= 0) {
               updated[comboIdx].items.splice(itemIndex, 1);
            }
         }
      }
      setAllCombos(updated);
      setDeleteDialogOpen(false);
   }, [allCombos, deleteTarget, setAllCombos]);

   /* ------------------------------------------
      HANDLERS: Duplicating combos or items
  ------------------------------------------ */
   const duplicateCombo = useCallback(
      (index: number) => {
         const updated = [...allCombos];
         const comboToDup = updated[index];
         if (!comboToDup) return;
         // Copy items
         const duplicatedItems = comboToDup.items.map(item => {
            if (item instanceof TechniqueRef) {
               return new TechniqueRef(uuidv4(), item.techId, item.tags ? [...item.tags] : []);
            } else if (item instanceof DividerItem) {
               return new DividerItem(uuidv4(), item.text);
            }
            return item;
         });
         // New combo object
         const newCombo = new Combo(uuidv4(), comboToDup.name + ' (Copy)', comboToDup.difficulty, comboToDup.tags ? [...comboToDup.tags] : [], comboToDup.notes, comboToDup.dividerText, duplicatedItems);
         updated.splice(index + 1, 0, newCombo);
         setAllCombos(updated);
      },
      [allCombos, setAllCombos],
   );

   const duplicateTechnique = useCallback(
      (comboIndex: number, techniqueIndex: number) => {
         const updated = [...allCombos];
         const combo = updated[comboIndex];
         if (!combo) return;
         const item = combo.items[techniqueIndex];
         if (item instanceof TechniqueRef) {
            combo.items.push(new TechniqueRef(uuidv4(), item.techId, item.tags ? [...item.tags] : []));
         }
         setAllCombos(updated);
      },
      [allCombos, setAllCombos],
   );

   /* ------------------------------------------
      HANDLERS: Tagging a techn/* ------------------------------------------
   HANDLERS: Tagging a technique
------------------------------------------ */
   const openTechniqueTagsDialog = useCallback(
      (comboIndex: number, techniqueIndex: number) => {
         const combo = allCombos[comboIndex];
         if (!combo) return;
         const item = combo.items[techniqueIndex];
         if (!(item instanceof TechniqueRef)) return;

         // figure out the technique category
         const tech = techniqueMap.get(item.techId);
         const category = tech?.type || '';
         setTechniqueCategoryInDialog(category);
         setTechniqueTags(item.tags ? [...item.tags] : []);
         setTagEditComboIndex(comboIndex);
         setTagEditTechniqueIndex(techniqueIndex);
         setTechniqueTagsDialogOpen(true);
      },
      [allCombos],
   );

   const handleSaveTechniqueTags = useCallback(() => {
      if (tagEditComboIndex === null || tagEditTechniqueIndex === null) {
         setTechniqueTagsDialogOpen(false);
         return;
      }
      const updated = [...allCombos];
      const combo = updated[tagEditComboIndex];
      const item = combo.items[tagEditTechniqueIndex];
      if (item instanceof TechniqueRef) {
         // capitalizing each for consistency
         const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
         item.tags = techniqueTags.map(capitalize);
      }
      setAllCombos(updated);
      setTechniqueTagsDialogOpen(false);
   }, [tagEditComboIndex, tagEditTechniqueIndex, techniqueTags, allCombos, setAllCombos]);

   const removeTechniqueTag = useCallback(
      (comboIndex: number, techniqueIndex: number, tagToRemove: string) => {
         const updated = [...allCombos];
         const combo = updated[comboIndex];
         const item = combo.items[techniqueIndex];
         if (item instanceof TechniqueRef) {
            item.tags = (item.tags || []).filter(t => t !== tagToRemove);
         }
         setAllCombos(updated);
      },
      [allCombos, setAllCombos],
   );

   /* ------------------------------------------
      HANDLERS: Step Dividers (within a combo)
  ------------------------------------------ */
   const openAddDividerDialog = useCallback((comboIndex: number) => {
      setTargetComboIndexForDivider(comboIndex);
      setDividerText('');
      setAddDividerDialogOpen(true);
   }, []);

   const handleAddDivider = useCallback(() => {
      if (targetComboIndexForDivider === null || dividerText.trim() === '') {
         setAddDividerDialogOpen(false);
         return;
      }
      const updated = [...allCombos];
      const combo = updated[targetComboIndexForDivider];
      combo.items.push(new DividerItem(uuidv4(), dividerText));
      setAllCombos(updated);
      setAddDividerDialogOpen(false);
   }, [allCombos, dividerText, targetComboIndexForDivider, setAllCombos]);

   /* 
    If you also want "Add Divider" at the top list level (like a 
    top-level separate "combo divider"), you can replicate 
    a similar flow or do it here as well. 
  */

   /* ------------------------------------------
      HANDLERS: Preview
  ------------------------------------------ */
   const startPreview = useCallback((comboIndex: number) => {
      setCurrentTechniqueIndex(0);
      setPreviewComboIndex(comboIndex);
      setPreviewMode(true);
   }, []);

   const nextTechnique = useCallback(() => {
      if (previewComboIndex === null) return;
      const combo = allCombos[previewComboIndex];
      if (!combo) return;
      setCurrentTechniqueIndex(prev => Math.min(prev + 1, combo.items.length - 1));
   }, [previewComboIndex, allCombos]);

   const prevTechnique = useCallback(() => {
      setCurrentTechniqueIndex(prev => Math.max(prev - 1, 0));
   }, []);

   const closePreview = useCallback(() => {
      setPreviewMode(false);
      setPreviewComboIndex(null);
      setCurrentTechniqueIndex(0);
   }, []);

   /* ------------------------------------------
      RENDER
  ------------------------------------------ */
   return (
      <>
         <DraggableList items={combos.map(combo => ({id: combo.id}))} onReorder={handleComboReorder}>
            {combos.map((combo, comboIndex) => {
               // Gather rank info for the "accordion" title
               const ranks = combo.items
                  .filter((i): i is TechniqueRef => i instanceof TechniqueRef)
                  .map(tr => {
                     const tech = techniqueMap.get(tr.techId);
                     if (!tech) return null;
                     const g = FindGradeByTechniqueId(gradeData, tech.id);
                     return g.rankName;
                  })
                  .filter((rank): rank is string => rank !== null);

               const uniqueRanks = Array.from(new Set(ranks));

               if (combo.dividerText) {
                  // This is a "divider combo" at the top level
                  return (
                     <DraggableListItem
                        key={combo.id}
                        id={combo.id}
                        contentComponentProps={{
                           id: combo.id,
                           children: null,
                           title: combo.name || '(divider)',
                           comboIndex: comboIndex,
                           tags: combo.tags,
                           duplicateCombo: duplicateCombo, // might be hidden for divider
                           openComboDeleteDialog: (id: string) => openDeleteDialog(id),
                           uniqueRanks,
                        }}>
                        <Box
                           sx={{
                              width: '100%',
                              display: 'flex',
                              alignItems: 'center',
                           }}>
                           <Divider flexItem sx={{flexGrow: 1}}>
                              <Typography variant='h6'>{combo.dividerText}</Typography>
                           </Divider>
                           <Box sx={{marginLeft: '1em'}}>
                              <IconButton aria-label='delete' onClick={() => openDeleteDialog(combo.id)}>
                                 <DeleteIcon />
                              </IconButton>
                           </Box>
                        </Box>
                     </DraggableListItem>
                  );
               } else {
                  // Normal combo
                  return (
                     <DraggableListItem
                        key={combo.id}
                        id={combo.id}
                        ContentComponent={DraggableListItemContentAccordion}
                        contentComponentProps={{
                           id: combo.id,
                           children: null,
                           title: combo.name,
                           comboIndex: comboIndex,
                           tags: combo.tags,
                           duplicateCombo: duplicateCombo,
                           openComboDeleteDialog: (id: string) => openDeleteDialog(id),
                           uniqueRanks,
                        }}>
                        <Box>
                           {/* Draggable list of items inside the combo */}
                           <DraggableList items={combo.items.map(i => ({id: i.id}))} onReorder={newOrder => handleComboItemsReorder(comboIndex, newOrder)}>
                              {combo.items.map((item, itemIndex) => {
                                 if (item instanceof TechniqueRef) {
                                    const tech = techniqueMap.get(item.techId);
                                    if (!tech) {
                                       return (
                                          <DraggableListItem key={uuidv4()} id={item.id}>
                                             <Box>No Technique Found</Box>
                                          </DraggableListItem>
                                       );
                                    }
                                    const g = FindGradeByTechniqueId(gradeData, tech.id);
                                    const category = tech.type;
                                    return (
                                       // Technique item
                                       <DraggableListItem key={item.id} id={item.id}>
                                          <Box
                                             sx={{
                                                width: '100%',
                                                display: 'flex',
                                                alignItems: 'center',
                                             }}>
                                             {/* Icon & Belt */}
                                             {category === 'Kick' && <KickIcon sx={{fontSize: '2em', marginRight: '0.5em'}} />}
                                             {category === 'Stand' && <StandIcon sx={{fontSize: '2em', marginRight: '0.5em'}} />}
                                             {category === 'Block' && <BlockIcon sx={{fontSize: '2em', marginRight: '0.5em'}} />}
                                             {category === 'Strike' && <StrikeIcon sx={{fontSize: '2em', marginRight: '0.5em'}} />}
                                             <Box sx={{width: '5em'}}>
                                                <KarateBelt sx={{width: '4em', height: '1em'}} borderRadius='0' stripes={g.stripeNumber} color={g.beltColor} thickness='0.5em' orientation='horizontal' />
                                             </Box>

                                             {/* Maybe show Uraken icon? */}
                                             {tech.romaji.toLowerCase().includes('uraken') ? (
                                                <Box
                                                   sx={{
                                                      background: 'smoke',
                                                      display: 'flex',
                                                      justifyContent: 'center',
                                                      alignItems: 'center',
                                                      height: '1.4rem',
                                                      width: '1.4rem',
                                                      padding: '0.1rem',
                                                      border: '0.08rem solid black',
                                                      boxShadow: '0rem 0.2rem 0.2rem rgba(0, 0, 0, 0.2)',
                                                      borderRadius: '0.5rem',
                                                      marginLeft: '0.5em',
                                                   }}>
                                                   <Uraken />
                                                </Box>
                                             ) : (
                                                <Box
                                                   sx={{
                                                      height: '1.4rem',
                                                      width: '1.4rem',
                                                      marginLeft: '0.5em',
                                                   }}
                                                />
                                             )}

                                             {/* Technique name and tags */}
                                             <Typography sx={{marginLeft: '1rem'}}>{tech.romaji}</Typography>
                                             {item.tags && item.tags.map((tag, idx) => <Chip key={idx} label={tag} size='small' sx={{margin: '0.2em'}} onDelete={() => removeTechniqueTag(comboIndex, itemIndex, tag)} />)}

                                             {/* Action buttons */}
                                             <Box
                                                sx={{
                                                   display: 'flex',
                                                   alignItems: 'center',
                                                   marginLeft: 'auto',
                                                }}>
                                                {/* Edit technique tags */}
                                                <IconButton aria-label='edit-tags' onClick={() => openTechniqueTagsDialog(comboIndex, itemIndex)}>
                                                   <AddIcon />
                                                </IconButton>

                                                {/* Duplicate technique */}
                                                <IconButton aria-label='duplicate-technique' onClick={() => duplicateTechnique(comboIndex, itemIndex)}>
                                                   <ContentCopyIcon />
                                                </IconButton>

                                                {/* Delete technique */}
                                                <IconButton aria-label='remove' onClick={() => openDeleteDialog(combo.id, item.id)}>
                                                   <DeleteIcon />
                                                </IconButton>
                                             </Box>
                                          </Box>
                                       </DraggableListItem>
                                    );
                                 } else if (item instanceof DividerItem) {
                                    return (
                                       <DraggableListItem key={item.id} id={item.id}>
                                          <Box
                                             sx={{
                                                width: '100%',
                                                display: 'flex',
                                                alignItems: 'center',
                                             }}>
                                             <Divider flexItem sx={{flexGrow: 1}}>
                                                <Typography variant='h6'>{item.text}</Typography>
                                             </Divider>
                                             <Box sx={{marginLeft: '1em'}}>
                                                <IconButton aria-label='delete' onClick={() => openDeleteDialog(combo.id, item.id)}>
                                                   <DeleteIcon />
                                                </IconButton>
                                             </Box>
                                          </Box>
                                       </DraggableListItem>
                                    );
                                 } else {
                                    return (
                                       <DraggableListItem key={uuidv4()} id={combo.id}>
                                          Nothing here.
                                       </DraggableListItem>
                                    );
                                 }
                              })}
                           </DraggableList>

                           {/* Difficulty & Stats */}
                           <Box sx={{marginLeft: '1em', marginTop: '1em'}}>
                              <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                 <Typography variant='body1' color='textSecondary'>
                                    Difficulty:
                                 </Typography>
                                 <LinearProgress variant='determinate' value={combo.difficulty === 'Beginner' ? 33 : combo.difficulty === 'Intermediate' ? 66 : 100} sx={{width: '20%', height: '1em'}} />
                              </Box>
                              <Typography variant='body1' color='textSecondary' sx={{marginTop: '0.5em'}}>
                                 Techniques: {combo.items.filter((it): it is TechniqueRef => it instanceof TechniqueRef).length}
                              </Typography>
                           </Box>

                           {/* Notes */}
                           {combo.notes && (
                              <Box sx={{marginLeft: '1em', marginTop: '1em'}}>
                                 <Typography variant='body1' color='textSecondary'>
                                    Notes:
                                 </Typography>
                                 <Typography variant='body2'>{combo.notes}</Typography>
                              </Box>
                           )}

                           {/* Action buttons at bottom of combo */}
                           <Box
                              sx={{
                                 display: 'flex',
                                 justifyContent: 'flex-end',
                                 marginTop: '1em',
                                 gap: 2,
                              }}>
                              <Button
                                 variant='outlined'
                                 color='primary'
                                 startIcon={<AddIcon />}
                                 onClick={() => {
                                    setSelectedComboIndexForAdding(comboIndex);
                                    setComboNameInDialog(combo.name);
                                    setComboDifficultyInDialog(combo.difficulty);
                                    setComboTagsInDialog(combo.tags ? [...combo.tags] : []);
                                    setComboNotesInDialog(combo.notes || '');
                                    setAddTechniqueDialogOpen(true);
                                 }}>
                                 Add/Edit Techniques
                              </Button>
                              <Button variant='outlined' color='primary' startIcon={<AddIcon />} onClick={() => openAddDividerDialog(comboIndex)}>
                                 Add Step Divider
                              </Button>
                              <Button variant='outlined' color='primary' startIcon={<PreviewIcon />} onClick={() => startPreview(comboIndex)}>
                                 Preview
                              </Button>
                              <Button
                                 variant='outlined'
                                 color='primary'
                                 onClick={() => {
                                    setComboIndexToRename(comboIndex);
                                    setRenameDialogOpen(true);
                                 }}>
                                 Rename
                              </Button>
                           </Box>
                        </Box>
                     </DraggableListItem>
                  );
               }
            })}
         </DraggableList>

         {/* Delete Confirmation Dialog */}
         <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogContent>{deleteTarget.itemId ? 'Are you sure you want to delete this technique/divider?' : 'Are you sure you want to delete this combo?'}</DialogContent>
            <DialogActions>
               <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
               <Button onClick={handleDeleteConfirmed} color='error'>
                  Delete
               </Button>
            </DialogActions>
         </Dialog>

         {/* Add Divider Dialog */}
         <Dialog open={addDividerDialogOpen} onClose={() => setAddDividerDialogOpen(false)} fullWidth maxWidth='sm'>
            <DialogTitle>Add Divider</DialogTitle>
            <DialogContent>
               <TextField autoFocus margin='dense' label='Divider Text' type='text' fullWidth value={dividerText} onChange={e => setDividerText(e.target.value)} />
            </DialogContent>
            <DialogActions>
               <Button onClick={() => setAddDividerDialogOpen(false)}>Cancel</Button>
               <Button onClick={handleAddDivider}>Add</Button>
            </DialogActions>
         </Dialog>

         {/* Preview Dialog */}
         <Dialog open={previewMode} onClose={closePreview} fullWidth maxWidth='sm'>
            <DialogTitle>Combo Preview</DialogTitle>
            <DialogContent>
               {previewComboIndex !== null && (
                  <>
                     {allCombos[previewComboIndex].items.map((item, idx) => {
                        if (item instanceof TechniqueRef) {
                           const tech = techniqueMap.get(item.techId);
                           if (!tech) return null;
                           return (
                              <Typography key={item.id} variant='h6'>
                                 {tech.romaji}
                              </Typography>
                           );
                        } else if (item instanceof DividerItem) {
                           return (
                              <Divider key={item.id} sx={{margin: '1em 0'}}>
                                 <Typography variant='h6'>{item.text}</Typography>
                              </Divider>
                           );
                        }
                        return null;
                     })}
                     <Box sx={{marginTop: '1em'}}>
                        <Typography>
                           Step {currentTechniqueIndex + 1} of {allCombos[previewComboIndex].items.length}
                        </Typography>
                     </Box>
                  </>
               )}
            </DialogContent>
            <DialogActions>
               <Button onClick={prevTechnique} disabled={currentTechniqueIndex === 0}>
                  Previous
               </Button>
               <Button onClick={nextTechnique} disabled={previewComboIndex !== null && currentTechniqueIndex === allCombos[previewComboIndex].items.length - 1}>
                  Next
               </Button>
            </DialogActions>
         </Dialog>

         {/* Technique Tags Dialog */}
         <Dialog open={techniqueTagsDialogOpen} onClose={() => setTechniqueTagsDialogOpen(false)} fullWidth maxWidth='sm'>
            <DialogTitle>Edit Technique Tags</DialogTitle>
            <DialogContent>
               {techniqueCategoryInDialog ? (
                  <Autocomplete
                     multiple
                     freeSolo
                     options={specialTechniqueTagsByCategory[techniqueCategoryInDialog] || []}
                     value={techniqueTags}
                     onChange={(_, newValue) => {
                        // capitalization
                        const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
                        setTechniqueTags(newValue.map(capitalize));
                     }}
                     renderTags={(value: string[], getTagProps) => value.map((option: string, index: number) => <Chip variant='outlined' label={option} {...getTagProps({index})} />)}
                     renderInput={params => <TextField {...params} variant='outlined' label='Technique Tags' placeholder='Select or add tags' />}
                  />
               ) : (
                  <Typography color='error'>Technique category not found. Cannot assign tags.</Typography>
               )}
            </DialogContent>
            <DialogActions>
               <Button onClick={() => setTechniqueTagsDialogOpen(false)}>Cancel</Button>
               <Button onClick={handleSaveTechniqueTags} disabled={!techniqueCategoryInDialog}>
                  Save
               </Button>
            </DialogActions>
         </Dialog>
      </>
   );
};

export default ComboItemsList;
