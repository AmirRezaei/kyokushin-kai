// HEADER-START
// * Path: ./src/components/UI/DraggableList/DraggableListItemContentAccordion.tsx
// HEADER-END

import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {Accordion, AccordionDetails, AccordionSummary, Box, Checkbox, IconButton, Typography} from '@mui/material';
import Chip from '@mui/material/Chip';
import {useTheme} from '@mui/material/styles';
import React, {FC, useContext} from 'react';

import kyokushinRanks from '@/data/kyokushinRanks';

import KarateBelt from '../KarateBelt';
import {CheckedItemsContext} from './DraggableList';
import {DraggableListItemContentProps} from './DraggableListItemContent';

interface AdditionalProps {
   comboIndex: number;
   title: string;
   tags?: string[];
   duplicateCombo: (comboIndex: number) => void;
   openComboDeleteDialog: (comboId: string) => void;
   uniqueRanks: string[];
}

const DraggableListItemContentAccordion: FC<DraggableListItemContentProps & AdditionalProps> = props => {
   const theme = useTheme();
   const context = useContext(CheckedItemsContext);

   if (!context) {
      throw new Error('DraggableListItemContent must be used within a DraggableList');
   }

   const {checkedItems, setCheckedItems} = context;
   const checked = !!checkedItems[props.id];

   const onCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      event.stopPropagation();
      setCheckedItems(prev => ({
         ...prev,
         [props.id]: event.target.checked,
      }));
   };

   return (
      <Accordion sx={{width: '100%'}}>
         <AccordionSummary
            sx={{
               backgroundColor: checked ? theme.palette.action.selected : undefined,
            }}
            expandIcon={props.isDragging ? undefined : <ExpandMoreIcon />}
            aria-controls={`panel${props.id}-content`}
            id={`panel${props.id}-header`}>
            <Box
               sx={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
               }}>
               <Box sx={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                  <Typography
                     sx={{
                        marginRight: '0.5em',
                        display: 'flex',
                        alignItems: 'center',
                     }}>
                     {props.title || `Combo ${props.comboIndex + 1}`}
                  </Typography>
                  {props.tags && props.tags.map((tag, index) => <Chip key={index} label={tag} size='small' sx={{margin: '0.2em'}} />)}
                  <Box
                     sx={{
                        display: 'flex',
                        alignItems: 'center',
                        marginLeft: '0.5em',
                     }}>
                     {props.uniqueRanks.map((rank, index) => {
                        const rankData = kyokushinRanks[rank];
                        if (rankData) {
                           return (
                              <KarateBelt
                                 key={index}
                                 sx={{
                                    width: '1em',
                                    height: '1em',
                                    boxShadow: '0.1em 0.1em 0.1em rgba(0, 0, 0, 0.1)',
                                    marginRight: '0.2em',
                                 }}
                                 color={rankData.beltColor}
                                 thickness={'0.3em'}
                                 borderWidth={'0.05em'}
                                 stripes={rankData.beltStripe}
                                 borderRadius={'100%'}
                              />
                           );
                        } else {
                           return null;
                        }
                     })}
                  </Box>
               </Box>
               <Box
                  sx={{
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'flex-end',
                  }}>
                  {/* 
                  Uncomment and implement these buttons as needed.
                  <IconButton aria-label='edit-tags' onClick={() => openTechniqueTagsDialog(comboIndex, itemIndex)}>
                     <AddIcon />
                  </IconButton>
                  <IconButton aria-label='duplicate-technique' onClick={() => duplicateTechnique(comboIndex, itemIndex)}>
                     <ContentCopyIcon />
                  </IconButton>
                  <IconButton aria-label='remove' onClick={() => openComboItemDeleteDialog(combo.id, item.id)}>
                     <DeleteIcon />
                  </IconButton> 
                  */}

                  {!checked && !props.isDragging && (
                     <>
                        <IconButton sx={{mr: 1}} edge='end' aria-label='delete' onClick={() => props.openComboDeleteDialog(props.id)}>
                           <DeleteIcon />
                        </IconButton>
                        <IconButton
                           sx={{mr: 1}}
                           edge='end'
                           aria-label='duplicate'
                           onClick={event => {
                              event.stopPropagation();
                              props.duplicateCombo(props.comboIndex);
                           }}>
                           <ContentCopyIcon />
                        </IconButton>
                     </>
                  )}
                  {!props.isDragging && <Checkbox checked={checked} onChange={onCheckboxChange} onClick={event => event.stopPropagation()} />}
                  {checked && (
                     <IconButton aria-label='drag' sx={{cursor: 'grab', mr: 1}} {...props.dragHandleListeners} onClick={event => event.stopPropagation()}>
                        <DragIndicatorIcon />
                     </IconButton>
                  )}
               </Box>
            </Box>
         </AccordionSummary>
         {!props.isDragging && <AccordionDetails sx={{width: '100%'}}>{props.children}</AccordionDetails>}
      </Accordion>
   );
};

export default DraggableListItemContentAccordion;
