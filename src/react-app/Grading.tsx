// HEADER-START
// * Path: ./src/Grading.tsx
// HEADER-END

'use client';
import '@fontsource/roboto/400.css';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {Accordion, AccordionDetails, AccordionSummary, Box, Chip, Container, Divider, List, ListItem, Pagination, Paper, Stack, Typography} from '@mui/material';
import React, {useEffect, useState} from 'react';
import {usePapaParse} from 'react-papaparse';

import PersistentTextField from './PersistentTextField';

interface ValuePair {
   [key: number]: string;
}

const colorMapping: ValuePair = {
   1: 'gray',
   2: 'orange',
   3: 'orange',
   4: 'blue',
   5: 'blue',
   6: 'yellow',
   7: 'yellow',
   8: 'green',
   9: 'green',
   10: 'brown',
   11: 'brown',
   12: 'black',
   13: 'black',
};

const karateGrade: ValuePair = {
   1: 'Mukyu',
   2: '10th Kyu',
   3: '9th Kyu',
   4: '8th Kyu',
   5: '7th Kyu',
   6: '6th Kyu',
   7: '5th Kyu',
   8: '4th Kyu',
   9: '3rd Kyu',
   10: '2nd Kyu',
   11: '1st Kyu',
   12: 'Shodan',
   13: 'Nidan',
   14: 'Sandan',
   15: 'Yondan',
   16: 'Godan',
   17: 'Rokudan',
   18: 'Shichidan',
   19: 'Hachidan',
   20: 'Kyūdan',
   21: 'Jūdan',
};

const karateGradeColors: ValuePair = {
   1: 'White belt',
   2: 'Orange belt',
   3: 'Orange belt with strip',
   4: 'Blue belt',
   5: 'Blue belt with strip',
   6: 'Blue belt',
   7: 'Yellow belt with strip',
   8: 'Yellow belt',
   9: 'Green belt with strip',
   10: 'Green belt',
   11: 'Brown belt with strip',
   12: 'Brown belt',
   13: 'Brown',
   14: 'Black with one gold strip',
   15: 'Black with two gold stripes',
   16: 'Black with three gold stripes',
   17: 'Black with four gold stripes',
   18: 'Black with five gold stripes',
   19: 'Black with six gold stripes',
   20: 'Black with seven gold stripes',
   21: 'Black with eight gold stripes',
   22: 'Black with nine gold stripes',
   23: 'Black with ten gold stripes',
};

type KarateData = {
   id: number;
   grade: string;
   beltLevel: string;
   header: string;
   stance: string;
   strike: string;
   block: string;
   kick: string;
   kata: string;
   breathingTechnique: string;
   kumite: string;
   attackTechnique: string;
   defenseTechnique: string;
   footer: string;
};

const KarateInfo = () => {
   const [karateData, setKarateData] = useState<KarateData[]>([]);
   const {readString} = usePapaParse();
   const [currentPage, setCurrentPage] = useState(1);
   const [pageNumber, setPageNumber] = useState(1);

   const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
      setPageNumber(value);
   };

   useEffect(() => {
      // Assuming data.csv is available in the public directory or accessible via a static path
      fetch(process.env.PUBLIC_URL + '/data.csv')
         .then(response => response.text())
         .then(csvData => {
            readString(csvData, {
               delimiter: ';',
               header: true,
               skipEmptyLines: true,
               complete: (results: any) => {
                  const formattedData: KarateData[] = results.data
                     .filter((row: any) => row.id === String(pageNumber))
                     .map((row: any) => ({
                        id: row.id,
                        grade: row.grade,
                        beltLevel: row.beltLevel,
                        header: row.header,
                        stance: row.stance,
                        strike: row.strike,
                        block: row.block,
                        kick: row.kick,
                        kata: row.kata,
                        breathingTechnique: row.breathingTechnique,
                        kumite: row.kumite,
                        attackTechnique: row.attackTechnique,
                        defenseTechnique: row.defenseTechnique,
                        footer: row.footer,
                     }));
                  setKarateData(formattedData);
               },
            });
         })
         .catch(error => console.log('Error loading the CSV file: ', error));
   }, [readString, pageNumber]);

   return (
      <Container>
         <Accordion defaultExpanded={false}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls='panel3-content' id='panel3-header'>
               Noteringar
            </AccordionSummary>
            <AccordionDetails>
               <PersistentTextField name={`note${currentPage}`} helperText={`Anteckningar ${currentPage}`} />
            </AccordionDetails>
            {/* <AccordionActions>
          <Button>Cancel</Button>
          <Button>Agree</Button>
        </AccordionActions> */}
         </Accordion>

         <Paper
            elevation={3}
            sx={{
               margin: 2,
               padding: 1,
               bgcolor: '#eee7d7',
            }}>
            {karateData.length > 0 ? (
               <Container>
                  <Box marginBottom={0.2} height={10} borderRadius={1} bgcolor={colorMapping[pageNumber]}></Box>
                  <Box bgcolor={'#f6eee3'} display='flex'>
                     <Box flexGrow={1}>
                        {karateData
                           .filter(x => x.beltLevel.trim())
                           .map((data, i) => (
                              <Typography
                                 key={i}
                                 sx={{
                                    ml: 0,
                                    p: 0.0,
                                 }}
                                 color={'black'}
                                 variant='h4'>
                                 {data.beltLevel}
                              </Typography>
                           ))}
                     </Box>
                     {/* <Box display="flex" justifyContent="flex-end" alignItems="center"  >
                <SvgIcon component={BeltIcon} inheritViewBox />
              </Box> */}
                  </Box>

                  <Box marginBottom={2} marginTop={0.2} height={10} borderRadius={1} bgcolor={colorMapping[pageNumber]}></Box>

                  <List>
                     {karateData
                        .filter(x => x.header.trim())
                        .map((data, i) => (
                           <ListItem
                              key={i}
                              sx={{
                                 ml: 0,
                                 p: 0.0,
                              }}>
                              {data.header}
                           </ListItem>
                        ))}
                  </List>

                  <Typography
                     variant='h6'
                     sx={{
                        m: 0,
                        p: 0,
                     }}>
                     Blocks
                  </Typography>
                  <List>
                     {karateData
                        .filter(x => x.block.trim())
                        .map((data, i) => (
                           <ListItem
                              key={i}
                              sx={{
                                 mt: 0,
                                 ml: 1,
                                 p: 0.2,
                              }}>
                              {data.block}
                           </ListItem>
                        ))}
                  </List>

                  <Typography variant='h6'>Kicks</Typography>
                  <List>
                     {karateData
                        .filter(x => x.kick.trim())
                        .map((data, i) => (
                           <ListItem
                              key={i}
                              sx={{
                                 ml: 1,
                                 p: 0.2,
                              }}>
                              {data.kick}
                           </ListItem>
                        ))}
                  </List>

                  <Typography variant='h6'>Stances</Typography>
                  <List>
                     {karateData
                        .filter(x => x.stance.trim())
                        .map((data, i) => (
                           <ListItem
                              key={i}
                              sx={{
                                 ml: 1,
                                 p: 0.2,
                              }}>
                              {data.stance}
                           </ListItem>
                        ))}
                  </List>

                  <Typography variant='h6'>Strikes</Typography>
                  <List>
                     {karateData
                        .filter(x => x.strike.trim())
                        .map((data, i) => (
                           <ListItem
                              key={i}
                              sx={{
                                 ml: 1,
                                 p: 0.2,
                              }}>
                              {data.strike}
                           </ListItem>
                        ))}
                  </List>

                  <Typography variant='h6'>Kata</Typography>
                  <List>
                     {karateData
                        .filter(x => x.kata.trim())
                        .map((data, i) => (
                           <ListItem
                              key={i}
                              sx={{
                                 ml: 1,
                                 p: 0.0,
                              }}>
                              {data.kata}
                           </ListItem>
                        ))}
                  </List>

                  <Typography variant='h6'>Försvarsteknik</Typography>
                  <List>
                     {karateData
                        .filter(x => x.defenseTechnique.trim())
                        .map((data, i) => (
                           <ListItem
                              key={i}
                              sx={{
                                 ml: 1,
                                 p: 0.0,
                              }}>
                              {data.defenseTechnique}
                           </ListItem>
                        ))}
                  </List>

                  <Typography variant='h6'>Andningsteknik</Typography>
                  <List>
                     {karateData
                        .filter(x => x.breathingTechnique.trim())
                        .map((data, i) => (
                           <ListItem
                              key={i}
                              sx={{
                                 ml: 1,
                                 p: 0.0,
                              }}>
                              {data.breathingTechnique}
                           </ListItem>
                        ))}
                  </List>

                  <Typography variant='h6'>Kumite</Typography>
                  <List>
                     {karateData
                        .filter(x => x.kumite.trim())
                        .map((data, i) => (
                           <ListItem
                              key={i}
                              sx={{
                                 ml: 1,
                                 p: 0.0,
                              }}>
                              {data.kumite}
                           </ListItem>
                        ))}
                  </List>

                  <List>
                     {karateData
                        .filter(x => x.footer.trim())
                        .map((data, i) => (
                           <ListItem
                              key={i}
                              sx={{
                                 ml: 1,
                                 p: 0.0,
                              }}>
                              {data.footer}
                           </ListItem>
                        ))}
                  </List>

                  <Divider textAlign='center'>
                     <Chip label={pageNumber} size='medium' />
                  </Divider>

                  <Stack spacing={2}>
                     <Box display='flex' justifyContent='center'>
                        <Pagination
                           count={10} // Total number of pages
                           page={pageNumber}
                           onChange={handlePageChange}
                           color='primary'
                        />
                     </Box>
                  </Stack>
               </Container>
            ) : (
               <p>No data loaded</p>
            )}
         </Paper>
      </Container>
   );
};

export default KarateInfo;
