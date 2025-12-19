// HEADER-START
// * Path: ./src/components/Kihon/KihonList.tsx
// HEADER-END
import AddIcon from '@mui/icons-material/Add';
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';
import {
  Autocomplete,
  Box,
  Button,
  ButtonGroup,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { FindGradeByTechniqueId } from '@/app/Technique/TechniqueData';
// import {gradeData} from '@/data/gradeData'; // Removed
import { KyokushinRepository } from '../../../data/repo/KyokushinRepository';
import { getBeltColorHex, getStripeNumber } from '../../../data/repo/gradeHelpers';
import { TechniqueRecord, TechniqueKind } from '../../../data/model/technique';
import { getLocalStorageItems, setLocalStorageItems } from '../utils/localStorageUtils';
import ComboItemsList from './ComboItemsList';
import KarateBelt from '../UI/KarateBelt';

/* -------------------------------------------
   Types and Utility Classes
------------------------------------------- */

export class DividerItem {
  id: string;
  text: string;
  constructor(id: string, text: string) {
    this.id = id;
    this.text = text;
  }
}

export const techniqueMap = new Map<string, TechniqueRecord>();
// Populate map from Repository
const allTechs = KyokushinRepository.getAllTechniques();
for (const t of allTechs) {
  techniqueMap.set(t.id, t);
}

export class TechniqueRef {
  id: string; // instance id
  techId: string; // technique id
  tags?: string[];
  constructor(id: string, techId: string, tags?: string[]) {
    this.id = id;
    this.techId = techId;
    this.tags = tags;
  }
}

export type ComboItem = TechniqueRef | DividerItem;

export class Combo {
  id: string;
  name: string;
  items: ComboItem[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  tags?: string[];
  notes?: string;
  dividerText?: string;

  constructor(
    id: string,
    name: string,
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced',
    tags: string[] = [],
    notes: string = '',
    dividerText?: string,
    items: ComboItem[] = [],
  ) {
    this.id = id;
    this.name = name;
    this.items = items;
    this.difficulty = difficulty;
    this.tags = tags;
    this.notes = notes;
    this.dividerText = dividerText;
  }
}

function parseCombosFromJSON(data: unknown): Combo[] {
  if (!Array.isArray(data)) return [];
  return data.map((comboObj: any) => {
    const c = new Combo(
      comboObj.id,
      comboObj.name,
      comboObj.difficulty,
      comboObj.tags || [],
      comboObj.notes || '',
      comboObj.dividerText,
      [],
    );
    if (Array.isArray(comboObj.items)) {
      for (const itemObj of comboObj.items) {
        if (itemObj && typeof itemObj === 'object') {
          if (itemObj.text && itemObj.id) {
            // Divider
            c.items.push(new DividerItem(itemObj.id, itemObj.text));
          } else if (itemObj.id && !itemObj.text && techniqueMap.has(itemObj.techId)) {
            // TechniqueRef
            c.items.push(
              new TechniqueRef(
                itemObj.id,
                itemObj.techId,
                Array.isArray(itemObj.tags) ? [...itemObj.tags] : [],
              ),
            );
          }
        }
      }
    }
    return c;
  });
}

const capitalizeFirstLetter = (string: string) => string.charAt(0).toUpperCase() + string.slice(1);

/* -------------------------------------------
   KihonList Component
------------------------------------------- */

const KihonList: React.FC = React.memo(() => {
  const theme = useTheme();

  /* 
  -- Global combos state (and local storage) 
  */
  const [savedCombos, setSavedCombos] = useState<Combo[]>(() => {
    const stored = getLocalStorageItems<Combo[]>('savedCombos', []);
    return parseCombosFromJSON(stored);
  });

  useEffect(() => {
    const dataToStore = savedCombos.map((combo) => ({
      id: combo.id,
      name: combo.name,
      difficulty: combo.difficulty,
      tags: combo.tags,
      notes: combo.notes,
      dividerText: combo.dividerText,
      items: combo.items.map((item) => {
        if (item instanceof DividerItem) {
          return { id: item.id, text: item.text };
        } else if (item instanceof TechniqueRef) {
          return { id: item.id, techId: item.techId, tags: item.tags };
        }
        return item;
      }),
    }));
    setLocalStorageItems('savedCombos', dataToStore);
  }, [savedCombos]);

  /* 
  -- For filtering combos
  */
  const [difficultyFilter, setDifficultyFilter] = useState<
    'All' | 'Beginner' | 'Intermediate' | 'Advanced'
  >('All');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const filteredCombos = useMemo(() => {
    return savedCombos.filter((combo) => {
      let pass = true;
      if (difficultyFilter !== 'All') {
        pass = pass && combo.difficulty === difficultyFilter;
      }
      if (selectedTags.length > 0) {
        pass = pass && !!combo.tags && selectedTags.every((tag) => combo.tags?.includes(tag));
      }
      return pass;
    });
  }, [savedCombos, difficultyFilter, selectedTags]);

  /* 
  -- For "Create / Edit" combo dialog
  */
  const [addTechniqueDialogOpen, setAddTechniqueDialogOpen] = useState<boolean>(false);
  const [selectedComboIndexForAdding, setSelectedComboIndexForAdding] = useState<number | null>(
    null,
  );
  const [newTechniques, setNewTechniques] = useState<string[]>([]);
  const [comboNameInDialog, setComboNameInDialog] = useState<string>('');
  const [comboDifficultyInDialog, setComboDifficultyInDialog] = useState<
    'Beginner' | 'Intermediate' | 'Advanced'
  >('Beginner');
  const [comboTagsInDialog, setComboTagsInDialog] = useState<string[]>([]);
  const [comboNotesInDialog, setComboNotesInDialog] = useState<string>('');

  /* 
  -- For rename combo dialog
  */
  const [renameDialogOpen, setRenameDialogOpen] = useState<boolean>(false);
  const [comboIndexToRename, setComboIndexToRename] = useState<number | null>(null);
  const [newComboName, setNewComboName] = useState<string>('');

  /* 
  -- Export / Import 
  */
  const exportCombos = useCallback(() => {
    const dataToExport = savedCombos.map((combo) => ({
      id: combo.id,
      name: combo.name,
      difficulty: combo.difficulty,
      tags: combo.tags,
      notes: combo.notes,
      dividerText: combo.dividerText,
      items: combo.items.map((item) => {
        if (item instanceof DividerItem) {
          return { id: item.id, text: item.text };
        } else if (item instanceof TechniqueRef) {
          return { id: item.id, techId: item.techId, tags: item.tags };
        }
        return item;
      }),
    }));
    const dataStr = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'combos.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [savedCombos]);

  const importCombos = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        try {
          const parsedCombos = JSON.parse(content);
          const imported = parseCombosFromJSON(parsedCombos);
          setSavedCombos(imported);
        } catch (error) {
          console.error('Failed to import combos:', error);
        }
      };
      reader.readAsText(file);
      event.target.value = '';
    }
  }, []);

  /* 
  -- Creating a new combo from scratch 
  */
  const createNewCombo = useCallback(() => {
    setSelectedComboIndexForAdding(null);
    setNewTechniques([]);
    setComboNameInDialog('');
    setComboDifficultyInDialog('Beginner');
    setComboTagsInDialog([]);
    setComboNotesInDialog('');
    setAddTechniqueDialogOpen(true);
  }, []);

  /*
  -- Renaming an existing combo 
  */
  const renameCombo = useCallback(
    (index: number, newName: string) => {
      const updatedCombos = [...savedCombos];
      updatedCombos[index].name = newName;
      setSavedCombos(updatedCombos);
    },
    [savedCombos],
  );

  const closeRenameDialog = useCallback(() => {
    setRenameDialogOpen(false);
    setComboIndexToRename(null);
    setNewComboName('');
  }, []);

  /* 
  -- All techniques in memory 
  */
  const allTechniques = useMemo(() => {
    return Array.from(techniqueMap.values());
  }, []);

  // List of displayable technique kinds
  const displayableTechniqueKinds = [
    TechniqueKind.Stand,
    TechniqueKind.Strike,
    TechniqueKind.Block,
    TechniqueKind.Kick,
    TechniqueKind.Breathing,
    TechniqueKind.Fighting,
  ];

  /* 
  -- Helper Function to Close and Reset the Dialog
  */
  const handleCloseDialog = useCallback(() => {
    setAddTechniqueDialogOpen(false);
    setSelectedComboIndexForAdding(null);
    setNewTechniques([]);
    setComboNameInDialog('');
    setComboDifficultyInDialog('Beginner');
    setComboTagsInDialog([]);
    setComboNotesInDialog('');
  }, []);

  return (
    <Container>
      <Box marginTop={2}>
        <Typography variant="h5" gutterBottom>
          Combo Editor
        </Typography>
        <ButtonGroup variant="contained" aria-label="Basic button group">
          <Button color="primary" startIcon={<AddIcon />} onClick={createNewCombo}>
            Combo
          </Button>
          {/* Let ComboItemsList handle the "Add Divider" at top-level if desired */}
        </ButtonGroup>
      </Box>

      <Box marginTop={4}>
        <FormControl fullWidth margin="normal">
          <InputLabel>Filter by Difficulty</InputLabel>
          <Select
            value={difficultyFilter}
            onChange={(e) =>
              setDifficultyFilter(
                e.target.value as 'All' | 'Beginner' | 'Intermediate' | 'Advanced',
              )
            }
            label="Filter by Difficulty"
          >
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="Beginner">Beginner</MenuItem>
            <MenuItem value="Intermediate">Intermediate</MenuItem>
            <MenuItem value="Advanced">Advanced</MenuItem>
          </Select>
        </FormControl>

        <Autocomplete
          multiple
          options={[...new Set(savedCombos.flatMap((c) => c.tags || []))]} // allTags logic inline
          value={selectedTags}
          onChange={(_, newValue) => {
            setSelectedTags(newValue);
          }}
          renderTags={(value: string[], getTagProps) =>
            value.map((option: string, index: number) => (
              <Chip variant="outlined" label={option} {...getTagProps({ index })} />
            ))
          }
          renderInput={(params) => (
            <TextField
              {...params}
              variant="outlined"
              label="Filter by Tags"
              placeholder="Select tags"
              margin="normal"
            />
          )}
        />

        {/* 
          Pass combos & state setters down to ComboItemsList,
          so all combo/item manipulations happen in that component.
        */}
        <ComboItemsList
          combos={filteredCombos}
          allCombos={savedCombos}
          setAllCombos={setSavedCombos}
          setAddTechniqueDialogOpen={setAddTechniqueDialogOpen}
          setSelectedComboIndexForAdding={setSelectedComboIndexForAdding}
          setComboNameInDialog={setComboNameInDialog}
          setComboDifficultyInDialog={setComboDifficultyInDialog}
          setComboTagsInDialog={setComboTagsInDialog}
          setComboNotesInDialog={setComboNotesInDialog}
          setRenameDialogOpen={setRenameDialogOpen}
          setComboIndexToRename={setComboIndexToRename}
        />
      </Box>

      <ButtonGroup variant="contained" aria-label="Basic button group" sx={{ marginTop: 2 }}>
        <Button color="secondary" startIcon={<UploadIcon />} onClick={exportCombos}>
          Export
        </Button>
        <input
          accept="application/json"
          style={{ display: 'none' }}
          id="import-combos"
          type="file"
          onChange={importCombos}
        />
        <label htmlFor="import-combos">
          <Button color="secondary" component="span" startIcon={<DownloadIcon />}>
            Import
          </Button>
        </label>
      </ButtonGroup>

      {/* Create / Edit Combo Dialog */}
      <Dialog
        open={addTechniqueDialogOpen}
        onClose={handleCloseDialog} // Use the helper
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {selectedComboIndexForAdding === null ? 'Create New Combo' : 'Edit Combo'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Combo Name"
            type="text"
            fullWidth
            value={comboNameInDialog}
            onChange={(e) => setComboNameInDialog(e.target.value)}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Difficulty</InputLabel>
            <Select
              value={comboDifficultyInDialog}
              onChange={(e) =>
                setComboDifficultyInDialog(
                  e.target.value as 'Beginner' | 'Intermediate' | 'Advanced',
                )
              }
            >
              <MenuItem value="Beginner">Beginner</MenuItem>
              <MenuItem value="Intermediate">Intermediate</MenuItem>
              <MenuItem value="Advanced">Advanced</MenuItem>
            </Select>
          </FormControl>

          <Autocomplete
            multiple
            freeSolo
            options={[...new Set(savedCombos.flatMap((c) => c.tags || []))]}
            value={comboTagsInDialog}
            onChange={(_, newValue) => {
              setComboTagsInDialog(newValue.map(capitalizeFirstLetter));
            }}
            renderTags={(value: string[], getTagProps) =>
              value.map((option: string, index: number) => (
                <Chip variant="outlined" label={option} {...getTagProps({ index })} />
              ))
            }
            renderInput={(params) => (
              <TextField {...params} variant="outlined" label="Combo Tags" />
            )}
          />

          <TextField
            margin="dense"
            label="Notes"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={comboNotesInDialog}
            onChange={(e) => setComboNotesInDialog(e.target.value)}
          />

          {/* Technique selection by type */}
          {displayableTechniqueKinds.map((type) => {
            const techniquesForType = allTechniques.filter((t) => t.kind === type);
            const selectedForType = newTechniques
              .filter((id) => {
                const tech = techniqueMap.get(id);
                return tech?.kind === type;
              })
              .map((id) => techniqueMap.get(id)?.name.romaji || '');

            return (
              <FormControl key={type} fullWidth margin="normal">
                <InputLabel id={`select-techniques-${type}`}>{type}</InputLabel>
                <Select
                  multiple
                  sx={{ width: '100%' }}
                  id={`select-techniques-${type}`}
                  label={type}
                  value={selectedForType}
                  onChange={(event: SelectChangeEvent<string[]>) => {
                    const vals = event.target.value as string[];
                    // Convert selected romaji back to technique IDs
                    const chosenIDs = vals
                      .map((jap) => {
                        for (const [tid, technique] of techniqueMap) {
                          if (technique.name.romaji === jap && technique.kind === type) return tid;
                        }
                        return '';
                      })
                      .filter((id) => id !== '');

                    const otherTechs = newTechniques.filter((id) => {
                      const tech = techniqueMap.get(id);
                      return tech?.kind !== type;
                    });

                    setNewTechniques([...otherTechs, ...chosenIDs]);
                  }}
                  renderValue={(selected) => (selected as string[]).join(', ')}
                >
                  {techniquesForType.map((technique) => {
                    const g = FindGradeByTechniqueId([], technique.id); // Pass empty array as it's ignored now
                    const isSelected = selectedForType.includes(technique.name.romaji || '');
                    const beltColorHex = getBeltColorHex(g.beltColor);
                    const stripes = getStripeNumber(g);

                    return (
                      <MenuItem key={technique.id} value={technique.name.romaji}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ width: '4em', marginRight: '1em' }}>
                            <KarateBelt
                              sx={{ width: '3em', height: '1em' }}
                              color={beltColorHex}
                              thickness="10px"
                              borderRadius="0"
                              stripes={stripes}
                            />
                          </Box>
                          <ListItemText
                            primary={technique.name.romaji}
                            sx={{ fontWeight: isSelected ? 'bold' : 'normal' }}
                          />
                        </Box>
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            );
          })}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={() => {
              const updatedCombos = [...savedCombos];
              if (selectedComboIndexForAdding !== null) {
                // Edit existing combo
                updatedCombos[selectedComboIndexForAdding].name = comboNameInDialog;
                updatedCombos[selectedComboIndexForAdding].difficulty = comboDifficultyInDialog;
                updatedCombos[selectedComboIndexForAdding].tags = comboTagsInDialog;
                updatedCombos[selectedComboIndexForAdding].notes = comboNotesInDialog;
                for (const tid of newTechniques) {
                  updatedCombos[selectedComboIndexForAdding].items.push(
                    new TechniqueRef(uuidv4(), tid),
                  );
                }
              } else {
                // Create new combo
                const newCombo = new Combo(
                  uuidv4(),
                  comboNameInDialog || `Combo ${savedCombos.length + 1}`,
                  comboDifficultyInDialog,
                  comboTagsInDialog,
                  comboNotesInDialog,
                  undefined,
                  newTechniques.map((tid) => new TechniqueRef(uuidv4(), tid)),
                );
                updatedCombos.push(newCombo);
              }
              setSavedCombos(updatedCombos);

              // Finally close and reset the dialog
              handleCloseDialog();
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Rename Combo Dialog */}
      <Dialog open={renameDialogOpen} onClose={closeRenameDialog} fullWidth maxWidth="sm">
        <DialogTitle>Rename Combo</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Combo Name"
            type="text"
            fullWidth
            value={newComboName}
            onChange={(e) => setNewComboName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeRenameDialog}>Cancel</Button>
          <Button
            onClick={() => {
              if (comboIndexToRename !== null) {
                renameCombo(comboIndexToRename, newComboName);
              }
              closeRenameDialog();
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
});

export default KihonList;
