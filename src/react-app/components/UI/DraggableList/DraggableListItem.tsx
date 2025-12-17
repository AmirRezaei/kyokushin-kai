// HEADER-START
// * Path: ./src/components/UI/DraggableList/DraggableListItem.tsx
// HEADER-END

import {useSortable} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import {ListItem} from '@mui/material';
import {SxProps, Theme} from '@mui/system';
import React, {useContext} from 'react';

import {CheckedItemsContext} from './DraggableList';
import DraggableListItemContent, {DraggableListItemContentProps} from './DraggableListItemContent';

interface DraggableListItemProps<T extends object> {
   id: string;
   children: React.ReactNode;
   ContentComponent?: React.ComponentType<DraggableListItemContentProps & T>;
   contentComponentProps?: DraggableListItemContentProps & T;
}

const DraggableListItem = <T extends object>({id, children, ContentComponent = DraggableListItemContent as React.ComponentType<DraggableListItemContentProps & T>, contentComponentProps}: DraggableListItemProps<T>) => {
   const {attributes, listeners, setNodeRef, transform, transition} = useSortable({id});
   const context = useContext(CheckedItemsContext);

   if (!context) {
      throw new Error('DraggableListItem must be used within a DraggableList');
   }

   const {isDragging, isPartOfActiveGroup, checkedItems} = context;
   const checked = !!checkedItems[id];

   const style: SxProps<Theme> = {
      ...(transform ? {transform: CSS.Transform.toString(transform)} : {}),
      ...(transition ? {transition} : {}),
      visibility: isDragging && checked && isPartOfActiveGroup(id) ? 'hidden' : 'visible',
   };

   return (
      <ListItem ref={setNodeRef} sx={style} {...attributes}>
         <ContentComponent id={id} isDragging={isDragging} dragHandleListeners={listeners} {...(contentComponentProps as T)}>
            {children}
         </ContentComponent>
      </ListItem>
   );
};

export default DraggableListItem;
