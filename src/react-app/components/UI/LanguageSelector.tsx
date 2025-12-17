// HEADER-START
// * Path: ./src/components/UI/LanguageSelector.tsx
// HEADER-END

import {Avatar, Checkbox, Divider, FormControl, ListItemText, MenuItem, OutlinedInput, Select, Stack, Typography} from '@mui/material';
import {useTheme} from '@mui/material/styles';
import React, {useCallback, useMemo} from 'react';

import {Language, LanguageEnum, Languages, useLanguage} from '../context/LanguageContext';

const MenuProps = {
   PaperProps: {
      style: {
         maxHeight: 300,
      },
   },
};

const LanguageSelector: React.FC = () => {
   const theme = useTheme();
   const {selectedLanguages, toggleLanguage, clearLanguages, isLanguageSelected} = useLanguage();

   // Handle language selection changes via toggle
   const handleToggle = useCallback(
      (language: Language) => {
         toggleLanguage(language);
      },
      [toggleLanguage],
   );

   // Handle "Clear All" action
   const handleClearAll = useCallback(() => {
      clearLanguages();
   }, [clearLanguages]);

   // Define the renderValue function to display selected languages
   const renderSelectedValues = useCallback(
      (selected: Language[]) => (
         <Stack direction='row' spacing={1} flexWrap='wrap'>
            {selected.map((value: Language) => {
               const lang = Languages.find(lang => lang.value === value);
               return (
                  lang && (
                     <Stack
                        key={value}
                        direction='row'
                        spacing={0.5}
                        alignItems='center'
                        sx={{
                           backgroundColor: theme.palette.mode === 'dark' ? theme.palette.action.selected : theme.palette.action.hover,
                           borderRadius: 1.5,
                           padding: theme.spacing(0.25, 0.75),
                        }}>
                        <Typography variant='body2'>{lang.icon}</Typography>
                        {/* Uncomment the following line if you want to display the language label */}
                        {/* <Typography variant="body2">{lang.label}</Typography> */}
                     </Stack>
                  )
               );
            })}
         </Stack>
      ),
      [theme],
   );

   // Memoize the menu items to prevent unnecessary re-renders
   const menuItems = useMemo(
      () => [
         // "Clear All" option
         <MenuItem key='clear-all' onClick={handleClearAll}>
            <Typography variant='body2' color='error'>
               Clear All
            </Typography>
         </MenuItem>,
         <Divider key='divider-clear' />,
         // Language options
         ...Languages.map(lang => (
            <MenuItem
               key={lang.value}
               value={lang.value}
               onClick={() => handleToggle(lang.value)}
               // Optionally, disable the MenuItem if the language is mandatory and selected
               disabled={lang.value === LanguageEnum.Romaji && isLanguageSelected(lang.value)}>
               <Checkbox checked={isLanguageSelected(lang.value)} />
               <Avatar
                  variant='square'
                  sx={{
                     width: '1em',
                     height: '1em',
                     mr: 1,
                     backgroundColor: 'transparent',
                  }}
                  aria-label={`${lang.label} icon`}>
                  {lang.icon}
               </Avatar>
               <ListItemText
                  primary={lang.label}
                  // primary={
                  //    lang.value === LanguageEnum.Japanese ? (
                  //       <Tooltip title='This language is mandatory'>
                  //          <span>
                  //             {lang.label}{' '}
                  //             <Typography component='span' color='error'>
                  //                *
                  //             </Typography>
                  //          </span>
                  //       </Tooltip>
                  //    ) : (
                  //       lang.label
                  //    )
                  // }
               />
            </MenuItem>
         )),
      ],
      [handleClearAll, handleToggle, isLanguageSelected],
   );

   return (
      <FormControl
         variant='outlined'
         size='small'
         sx={{
            backgroundColor: theme.palette.background.paper,
            borderRadius: 1,
         }}>
         {/* <InputLabel id='language-select-label' sx={{color: theme.palette.text.primary}}>
       Select Languages
     </InputLabel> */}
         <Select
            labelId='language-select-label'
            id='language-select'
            multiple
            value={selectedLanguages}
            onChange={() => {}} // Disable direct setting; use checkboxes instead
            input={<OutlinedInput label='Select Languages' />}
            renderValue={renderSelectedValues}
            MenuProps={MenuProps}
            sx={{
               color: theme.palette.text.primary,
            }}
            aria-labelledby='language-select-label'>
            {menuItems}
         </Select>
      </FormControl>
   );
};

export default React.memo(LanguageSelector);
