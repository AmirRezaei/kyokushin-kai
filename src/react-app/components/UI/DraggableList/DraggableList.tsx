// HEADER-START
// * Path: ./src/components/UI/DraggableList/DraggableList.tsx
// HEADER-END
// DraggableList.tsx

import {closestCorners, DndContext, DragEndEvent, DragOverlay, DragStartEvent, KeyboardSensor, MouseSensor, TouchSensor, useSensor, useSensors} from '@dnd-kit/core';
import {restrictToVerticalAxis} from '@dnd-kit/modifiers';
import {SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy} from '@dnd-kit/sortable';
import {Box, List} from '@mui/material';
import {useTheme} from '@mui/material/styles';
import React, {createContext, ReactElement, useCallback, useMemo, useState} from 'react';

import DraggableListItem from './DraggableListItem';
import DraggableListItemContent from './DraggableListItemContent';

interface DraggableListProps {
   children: ReactElement<React.ComponentProps<typeof DraggableListItem>>[] | ReactElement<React.ComponentProps<typeof DraggableListItem>> | null;
   /**
    * The array of items represented as {id: string}, controlled by the parent.
    */
   items: {id: string}[];

   /**
    * Callback fired when items are reordered.
    * Provides the new order of items as an array of {id: string}.
    */
   onReorder?: (newOrder: {id: string}[]) => void;
}

interface CheckedItemsContextValue {
   checkedItems: Record<string, boolean>;
   setCheckedItems: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
   isDragging: boolean;
   activeId: string | null;
   isPartOfActiveGroup: (id: string) => boolean;
}

export const CheckedItemsContext = createContext<CheckedItemsContextValue | null>(null);

const DraggableList: React.FC<DraggableListProps> = ({children, items, onReorder}) => {
   const theme = useTheme();
   const childrenArray = useMemo(() => (children ? (React.Children.toArray(children) as ReactElement<React.ComponentProps<typeof DraggableListItem>>[]) : []), [children]);

   const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
   const [activeId, setActiveId] = useState<string | null>(null);
   const [isDragging, setIsDragging] = useState(false);
   const [draggedItems, setDraggedItems] = useState<{id: string}[]>([]);

   const sensors = useSensors(
      useSensor(MouseSensor),
      useSensor(TouchSensor),
      useSensor(KeyboardSensor, {
         coordinateGetter: sortableKeyboardCoordinates,
      }),
   );

   const handleDragStart = useCallback(
      (event: DragStartEvent) => {
         const {active} = event;
         const activeIdStr = active.id as string;
         setActiveId(activeIdStr);
         setIsDragging(true);

         const isItemChecked = checkedItems[activeIdStr];

         const checkedIds = isItemChecked ? Object.keys(checkedItems).filter(id => checkedItems[id]) : [activeIdStr];

         const newDraggedItems = items.filter(item => checkedIds.includes(item.id));
         setDraggedItems(newDraggedItems);

         if (!isItemChecked) {
            setCheckedItems(prev => ({
               ...prev,
               [activeIdStr]: true,
            }));
         }
      },
      [checkedItems, items],
   );

   const handleDragEnd = useCallback(
      (event: DragEndEvent) => {
         const {active, over} = event;
         setActiveId(null);
         setIsDragging(false);
         setDraggedItems([]);

         if (!over) return;

         const activeIdStr = active.id as string;
         const overIdStr = over.id as string;

         if (activeIdStr !== overIdStr) {
            const checkedIds = Object.keys(checkedItems).filter(id => checkedItems[id]);
            if (checkedIds.length === 0) return;

            // Current order
            const currentItems = [...items];
            const overIndex = currentItems.findIndex(i => i.id === overIdStr);
            const firstCheckedIndex = currentItems.findIndex(i => i.id === checkedIds[0]);

            const uncheckedItems = currentItems.filter(item => !checkedIds.includes(item.id));
            const checkedItemsInOrder = currentItems.filter(item => checkedIds.includes(item.id));

            const isMovingDown = overIndex > firstCheckedIndex;
            const insertIndex = isMovingDown ? uncheckedItems.findIndex(item => item.id === overIdStr) + 1 : uncheckedItems.findIndex(item => item.id === overIdStr);

            let newOrder: {id: string}[] = [];
            if (insertIndex === -1) {
               // If overIdStr not found in uncheckedItems, append at the end
               newOrder = [...uncheckedItems, ...checkedItemsInOrder];
            } else {
               newOrder = [...uncheckedItems.slice(0, insertIndex), ...checkedItemsInOrder, ...uncheckedItems.slice(insertIndex)];
            }

            // Call onReorder if provided
            if (onReorder) {
               onReorder(newOrder);
            }

            // Reset checked items after reorder (optional)
            setCheckedItems({});
         }
      },
      [checkedItems, items, onReorder],
   );

   const isPartOfActiveGroup = useCallback((id: string) => isDragging && checkedItems[id] && activeId !== null && checkedItems[activeId], [isDragging, checkedItems, activeId]);

   return (
      <CheckedItemsContext.Provider value={{checkedItems, setCheckedItems, isDragging, activeId, isPartOfActiveGroup}}>
         <DndContext modifiers={[restrictToVerticalAxis]} sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <SortableContext items={items.map(item => item.id)} strategy={verticalListSortingStrategy}>
               <List>
                  {items.map(item => {
                     const child = childrenArray.find(c => c.props.id === item.id);
                     if (!child) return null;
                     return React.cloneElement(child, {
                        key: item.id,
                        id: item.id,
                     });
                  })}
               </List>
            </SortableContext>

            <DragOverlay>
               {isDragging && (
                  <Box
                     sx={{
                        border: `2px dashed ${theme.palette.action.active}`,
                     }}>
                     {draggedItems.map(item => {
                        const child = childrenArray.find(c => c.props.id === item.id);
                        if (!child) return null;

                        const ContentComponent = child.props.ContentComponent || DraggableListItemContent;
                        const contentProps = child.props.contentComponentProps || {};

                        return (
                           <ContentComponent key={item.id} id={item.id} isDragging={true} dragHandleListeners={{}} {...contentProps}>
                              {child.props.children}
                           </ContentComponent>
                        );
                     })}
                  </Box>
               )}
            </DragOverlay>
         </DndContext>
      </CheckedItemsContext.Provider>
   );
};

export default React.memo(DraggableList);
