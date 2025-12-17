// HEADER-START
// * Path: ./src/components/UI/DraggableList/DraggableListItemContent.tsx
// HEADER-END

import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import {Box, Checkbox, IconButton} from '@mui/material';
import {useTheme} from '@mui/material/styles';
import React, {useContext} from 'react';

import {CheckedItemsContext} from './DraggableList';

export interface DraggableListItemContentProps {
   id: string;
   isDragging?: boolean;
   children: React.ReactNode;
   dragHandleListeners?: Record<string, any>; // Ideally, use a proper type from dnd-kit
   addTechnique?: (comboIndex: string, techIndex: string) => void;
   deleteTechnique?: (comboIndex: string, techIndex: string) => void;
   duplicateTechnique?: (comboIndex: string, techIndex: string) => void;
}

const DraggableListItemContent: React.FC<DraggableListItemContentProps> = ({id, isDragging = false, children, dragHandleListeners}) => {
   const theme = useTheme();
   const context = useContext(CheckedItemsContext);

   if (!context) {
      throw new Error('DraggableListItemContent must be used within a DraggableList');
   }

   const {checkedItems, setCheckedItems} = context;
   const checked = !!checkedItems[id];

   const onCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      event.stopPropagation();
      setCheckedItems(prev => ({
         ...prev,
         [id]: event.target.checked,
      }));
   };

   return (
      <Box
         sx={{
            width: '100%',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'flex-start', // Changed from 'left' to 'flex-start'
            backgroundColor: checked ? theme.palette.action.selected : undefined,
         }}
         id={`panel${id}-header`}>
         {children}
         {/* 
         Uncomment and implement these buttons as needed.
         <IconButton aria-label='edit-tags' onClick={() => openTechniqueTagsDialog(comboIndex, techIndex)}>
            <AddIcon />
         </IconButton>
         <IconButton aria-label='duplicate-technique' onClick={() => duplicateTechnique(comboIndex, techIndex)}>
            <ContentCopyIcon />
         </IconButton>
         <IconButton aria-label='remove' onClick={() => openComboItemDeleteDialog(combo.id, item.id)}>
            <DeleteIcon />
         </IconButton> 
         */}

         {!isDragging && <Checkbox checked={checked} onChange={onCheckboxChange} onClick={event => event.stopPropagation()} />}
         {checked && (
            <IconButton aria-label='drag' sx={{cursor: 'grab'}} {...dragHandleListeners} onClick={event => event.stopPropagation()}>
               <DragIndicatorIcon />
            </IconButton>
         )}
      </Box>
   );
};

export default DraggableListItemContent;
