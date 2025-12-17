// HEADER-START
// * Path: ./src/components/UI/DraggableList/ThemeManager.tsx
// HEADER-END

import {Box, FormControl, InputLabel, MenuItem, Paper, Select, SelectChangeEvent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography} from '@mui/material';
import React from 'react';

import {useThemeContext} from '@/components/context/CustomThemeProvider';
import {palettes} from '@/components/palette/palettes';
import {ThemePalette} from '@/components/palette/themePalettes';

// Helper function to capitalize the first letter
const capitalizeFirstLetter = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

// Type definitions for Core Colors
type CoreColorCategory = keyof Pick<ThemePalette, 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success'>;

// Type definitions for Neutral Colors
type NeutralColorCategory = 'Divider' | 'Background Default' | 'Background Paper' | 'Text Primary' | 'Text Secondary' | 'Text Disabled';

// Type definitions for Action Colors
type ActionColorCategory = 'Active' | 'Hover' | 'Selected' | 'Disabled' | 'Disabled BG';

// Type definitions for Common Colors
type CommonColorCategory = 'Common Black' | 'Common White';

const ThemeManager: React.FC = () => {
   const {currentPalette, setPalette, isDarkMode} = useThemeContext();

   const handlePaletteChange = (event: SelectChangeEvent<string>) => {
      setPalette(event.target.value);
   };

   // Function to render a color box with a label
   const renderColorBox = (color: string, label: string, borderRadius: string = '2%') => (
      <Box sx={{textAlign: 'center', marginBottom: 0.5}}>
         <Box
            sx={{
               width: '2em',
               height: '1em',
               backgroundColor: color,
               borderRadius: borderRadius,
               margin: '0 auto',
               border: '1px solid #ccc',
            }}
         />
      </Box>
   );

   // Function to render a row for Core Colors
   const renderCoreColorRow = (category: CoreColorCategory, paletteData: ThemePalette) => {
      const colorCategory = paletteData[category] as {
         main: string;
         light?: string;
         dark?: string;
         contrastText?: string;
      };

      return (
         <TableRow key={category}>
            <TableCell component='th' scope='row'>
               <Typography variant='body2' fontWeight='bold'>
                  {capitalizeFirstLetter(category)}
               </Typography>
            </TableCell>
            <TableCell align='center'>{colorCategory.light ? renderColorBox(colorCategory.light, 'Light') : '-'}</TableCell>
            <TableCell align='center'>{colorCategory.main ? renderColorBox(colorCategory.main, 'Main') : '-'}</TableCell>
            <TableCell align='center'>{colorCategory.dark ? renderColorBox(colorCategory.dark, 'Dark') : '-'}</TableCell>
         </TableRow>
      );
   };

   // Function to render a row for Neutral Colors
   const renderNeutralColorRow = (category: NeutralColorCategory, paletteData: ThemePalette) => {
      let color: string | undefined = undefined;
      switch (category) {
         case 'Divider':
            color = paletteData.divider;
            break;
         case 'Background Default':
            color = paletteData.background.default;
            break;
         case 'Background Paper':
            color = paletteData.background.paper;
            break;
         case 'Text Primary':
            color = paletteData.text.primary;
            break;
         case 'Text Secondary':
            color = paletteData.text.secondary;
            break;
         case 'Text Disabled':
            color = paletteData.text.disabled;
            break;
         default:
            color = undefined;
      }

      return color ? (
         <TableRow key={category}>
            <TableCell component='th' scope='row'>
               <Typography variant='body2' fontWeight='bold'>
                  {category}
               </Typography>
            </TableCell>
            <TableCell align='center' colSpan={2}>
               {renderColorBox(color, 'Main')}
            </TableCell>
            <TableCell align='center'>-</TableCell>
         </TableRow>
      ) : null;
   };

   // Function to render a row for Action Colors
   const renderActionColorRow = (category: string, color: string) => (
      <TableRow key={category}>
         <TableCell component='th' scope='row'>
            <Typography variant='body2' fontWeight='bold'>
               {category}
            </Typography>
         </TableCell>
         <TableCell align='center' colSpan={2}>
            {renderColorBox(color, 'Main')}
         </TableCell>
         <TableCell align='center'>-</TableCell>
      </TableRow>
   );

   // Function to render a row for Common Colors
   const renderCommonColorRow = (category: CommonColorCategory, color: string) => (
      <TableRow key={category}>
         <TableCell component='th' scope='row'>
            <Typography variant='body2' fontWeight='bold'>
               {category}
            </Typography>
         </TableCell>
         <TableCell align='center' colSpan={2}>
            {renderColorBox(color, 'Main')}
         </TableCell>
         <TableCell align='center'>-</TableCell>
      </TableRow>
   );

   return (
      <FormControl fullWidth size='small'>
         <InputLabel id='palette-select-label'>Palette</InputLabel>
         <Select labelId='palette-select-label' value={currentPalette} label='Palette' onChange={handlePaletteChange} renderValue={selected => capitalizeFirstLetter(selected)}>
            {Object.entries(palettes).map(([paletteName, paletteVariants]) => {
               const paletteData = paletteVariants[isDarkMode ? 'dark' : 'light'];

               // Define Core Colors
               const coreColorCategories: CoreColorCategory[] = ['primary', 'secondary', 'error', 'warning', 'info', 'success'];

               // Define Neutral Colors
               const neutralColorCategories: NeutralColorCategory[] = ['Divider', 'Background Default', 'Background Paper', 'Text Primary', 'Text Secondary', 'Text Disabled'];

               // Define Action Colors
               const actionColorCategories: ActionColorCategory[] = ['Active', 'Hover', 'Selected', 'Disabled', 'Disabled BG'];

               // Define Common Colors
               const commonColorCategories: CommonColorCategory[] = ['Common Black', 'Common White'];

               return (
                  <MenuItem key={paletteName} value={paletteName}>
                     <Box sx={{padding: 2, maxWidth: 800}}>
                        <Typography variant='h6' gutterBottom align='center'>
                           {capitalizeFirstLetter(paletteName)}
                        </Typography>
                        <TableContainer component={Paper} variant='outlined'>
                           <Table size='small' aria-label='palette table'>
                              <TableHead>
                                 <TableRow>
                                    <TableCell>Category</TableCell>
                                    <TableCell align='center'>Light</TableCell>
                                    <TableCell align='center'>Main</TableCell>
                                    <TableCell align='center'>Dark</TableCell>
                                 </TableRow>
                              </TableHead>
                              <TableBody>
                                 {/* Core Colors Section */}
                                 <TableRow>
                                    <TableCell colSpan={4} sx={{backgroundColor: '#f0f0f0', fontWeight: 'bold'}}>
                                       Core Colors
                                    </TableCell>
                                 </TableRow>
                                 {coreColorCategories.map(category => renderCoreColorRow(category, paletteData))}

                                 {/* Neutral Colors Section */}
                                 <TableRow>
                                    <TableCell colSpan={4} sx={{backgroundColor: '#f0f0f0', fontWeight: 'bold'}}>
                                       Neutral Colors
                                    </TableCell>
                                 </TableRow>
                                 {neutralColorCategories.map(category => renderNeutralColorRow(category, paletteData))}

                                 {/* Action Colors Section */}
                                 <TableRow>
                                    <TableCell colSpan={4} sx={{backgroundColor: '#f0f0f0', fontWeight: 'bold'}}>
                                       Action Colors
                                    </TableCell>
                                 </TableRow>
                                 {Object.entries(paletteData.action).map(([key, value]) => renderActionColorRow(`${capitalizeFirstLetter(key)}`, value))}

                                 {/* Common Colors Section */}
                                 <TableRow>
                                    <TableCell colSpan={4} sx={{backgroundColor: '#f0f0f0', fontWeight: 'bold'}}>
                                       Common Colors
                                    </TableCell>
                                 </TableRow>
                                 {commonColorCategories.map(category => renderCommonColorRow(category, paletteData.common[category.split(' ')[1].toLowerCase() as 'black' | 'white']))}
                              </TableBody>
                           </Table>
                        </TableContainer>
                     </Box>
                  </MenuItem>
               );
            })}
         </Select>
      </FormControl>
   );
};

export default ThemeManager;
