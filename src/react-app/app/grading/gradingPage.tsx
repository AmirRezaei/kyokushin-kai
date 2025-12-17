// HEADER-START
// * Path: ./src/app/grading/gradingPage.tsx
// HEADER-END
// // HEADER-START
//    // * Project: Kyokushin
//    // * Path: src/app/grading/gradingPage.tsx
//    // ! Purpose: [Action Required: Summarize the component or file purpose.]
//
//    // ! Tech Stack and Libraries:
//    // - Core Frameworks: React, Vite
//    // - UI/Styling: MUI v6, MUI X-Charts, MUI X Data Grid, MUI X Date and Time Pickers, MUI X Tree View, TailwindCSS
//    // - TypeScript: Strict Mode Enabled
//    // - Package Manager: Yarn
//
//    // ? Additional Libraries:
//    // - Drag-and-Drop: @dnd-kit/core, @dnd-kit/sortable
//    // - Utilities: Lodash, UUID, date-fns, tone
//    // - Data Handling: XLSX, react-papaparse
//    // - Icons: MUI Icons, React Icons
//    // - Routing: React Router DOM
//
//    // ! Development Environment:
//    // - OS: Windows
//    // - Tools: PowerShell, VSCode
//
//    // ! Coding Guidelines:
//    // 1. Purpose Summary: Provide a concise description of the file's role based on the "Purpose" section.
//    // 2. Code Quality: Ensure code is readable, maintainable, and optimized for performance.
//    // 3. State Management: Use immutable state updates and minimize state where possible.
//    // 4. Rendering Optimization: Utilize React.memo, useCallback, and useMemo to optimize rendering efficiency.
//    // 5. State Management Libraries: Avoid prop drilling by leveraging Context API or state management libraries.
//    // 6. Side Effects Management:
//    //    - Ensure useEffect hooks are idempotent and handle multiple invocations gracefully, especially under React Strict Mode.
//    //    - Clean up side effects in useEffect and manage dependencies carefully.
//    //    - Use centralize side-effect operations (e.g., localStorage interactions) to maintain data integrity and ease debugging.
//    //      - Use utility functions 'getLocalStorageItem' and 'setLocalStorageItem' located at @/components/utils/localStorageUtils.ts.
//    //        - Function Signatures:
//    //          - const getLocalStorageItem = <T,>(key: string, defaultValue: T): T
//    //          - const setLocalStorageItem = <T,>(key: string, value: T): void
//    //          - const getLocalStorageItems = <T extends object>(key: string,defaultValue: T[]): T[]
//    //          - const setLocalStorageItems = <T extends object>(key: string, value: T[]): void
//    //          - const deleteLocalStorageItemById = <T extends { id: string }>(key: string,id: string): void
//    // 7. Modularization: Break down large components into smaller, reusable parts.
//    // 8. Semantic HTML & Styling: Use semantic HTML elements and modular styling approaches (e.g., CSS modules, TailwindCSS).
//    // 9. Error Handling:
//    //    - Implement robust error handling.
//    //    - Provide user-friendly feedback in case of errors.
//    // 10. Reactive State: Utilize useState or useRef for reactive state management; avoid using global variables.
//    // 11. Security: Identify and mitigate potential security vulnerabilities (e.g., XSS, injection attacks).
//    // 12. Code Conciseness: Ensure all generated code is concise and excludes this header.
//    // 13. This app is a static site with client-side rendering (CSR) where all pages are pre-generated during the build and directly loaded into the browser (e.g., hosted on a static file server or CDN).
//    // 14. Avoid Duplicate Rendering during development builds due to React Strict Mode.
//    // HEADER-END

// import KarateBelt from '@/components/UI/KarateBelt';
// import { gradeData } from '@/data/Data2';
// import VideoControlCard from '@/VideoControlCard';
// import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
// import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
// import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
// import Accordion from '@mui/material/Accordion';
// import AccordionDetails from '@mui/material/AccordionDetails';
// import AccordionSummary from '@mui/material/AccordionSummary';
// import Box from '@mui/material/Box';
// import Collapse from '@mui/material/Collapse';
// import Divider from '@mui/material/Divider';
// import IconButton from '@mui/material/IconButton';
// import List from '@mui/material/List';
// import ListItem from '@mui/material/ListItem';
// import ListItemText from '@mui/material/ListItemText';
// import Paper from '@mui/material/Paper';
// import Table from '@mui/material/Table';
// import TableBody from '@mui/material/TableBody';
// import TableCell from '@mui/material/TableCell';
// import TableContainer from '@mui/material/TableContainer';
// import TableHead from '@mui/material/TableHead';
// import TableRow from '@mui/material/TableRow';
// import Typography from '@mui/material/Typography';
// import React, { useState } from 'react';

// const gradingPage: React.FC = () => {
//    const [open, setOpen] = useState<number | null>(null);

//    const handleRowClick = (index: number) => {
//       setOpen(open === index ? null : index);
//    };

//    const ListSection: React.FC<{
//       title: string;
//       items: string[];
//    }> = ({ title, items }) => (
//       <>
//          <Typography variant="h6">{title}</Typography>
//          <List
//             sx={{
//                listStyleType: 'disc',
//                margin: '0 0 0 2em',
//                padding: 0,
//             }}
//          >
//             {items.map((item, index) => (
//                <ListItem
//                   sx={{
//                      display: 'list-item',
//                      margin: '0px 0px 0x 20px',
//                      padding: '0px 0px 0px 0px',
//                   }}
//                   key={index}
//                >
//                   <ListItemText primary={item} />
//                </ListItem>
//             ))}
//          </List>
//          <Divider />
//       </>
//    );

//    return (
//       <TableContainer component={Paper}>
//          <Table>
//             <TableHead>
//                <TableRow>
//                   <TableCell />
//                   <TableCell
//                      width={'90%'}
//                      style={{
//                         alignContent: 'left',
//                      }}
//                   />
//                   <TableCell />
//                </TableRow>
//             </TableHead>
//             <TableBody>
//                {gradeData.map((grade, i) => (
//                   <React.Fragment key={i}>
//                      <TableRow hover onClick={() => handleRowClick(i)}>
//                         <TableCell align="left" width={1}>
//                            <IconButton size="small">
//                               {open === i ? (
//                                  <KeyboardArrowUpIcon />
//                               ) : (
//                                  <KeyboardArrowDownIcon />
//                               )}
//                            </IconButton>
//                         </TableCell>
//                         <TableCell>
//                            <KarateBelt
//                               thickness={'0.5em'}
//                               color={grade.beltColor}
//                               orientation="horizontal"
//                               borderRadius='0'
//                               stripes={grade.stripeNumber}
//                               borderWidth='0.2em'
//                            />
//                         </TableCell>
//                         <TableCell
//                            style={{
//                               fontWeight: 'bold',
//                            }}
//                         >
//                            {grade.rankName}
//                         </TableCell>
//                      </TableRow>

//                      <TableRow>
//                         <TableCell />
//                         <TableCell
//                            style={{
//                               paddingBottom: 0,
//                               paddingTop: 0,
//                            }}
//                            colSpan={3}
//                         >
//                            <Collapse
//                               in={open === i}
//                               timeout="auto"
//                               unmountOnExit
//                            >
//                               {/* <ListSection
//                                  title="Stands"
//                                  items={grade.standsJPN}
//                               />
//                               <ListSection
//                                  title="Strikes"
//                                  items={grade.strikesJPN}
//                               />
//                               <ListSection
//                                  title="Kicks"
//                                  items={grade.kicksJPN}
//                               />
//                               <ListSection
//                                  title="Blocks"
//                                  items={grade.blocksJPN}
//                               /> */}

//                               <Box margin={1}>
//                                  {grade.katas.map((kata, j) => (
//                                     <Accordion variant="outlined" key={j}>
//                                        <AccordionSummary
//                                           expandIcon={<ExpandMoreIcon />}
//                                        >
//                                           <Typography align="left">
//                                              {kata.name} - {kata.japanese}
//                                           </Typography>
//                                        </AccordionSummary>
//                                        <AccordionDetails>
//                                           <Typography align="left">
//                                              {kata.description}
//                                           </Typography>
//                                           <Typography align="left">
//                                              {kata.history}
//                                           </Typography>
//                                           <VideoControlCard
//                                              subtitle={kata.description}
//                                              title={kata.name}
//                                              videoUrl={kata.youtubeKey}
//                                              altText={kata.name}
//                                           />
//                                        </AccordionDetails>
//                                     </Accordion>
//                                  ))}
//                               </Box>
//                            </Collapse>
//                         </TableCell>
//                      </TableRow>
//                   </React.Fragment>
//                ))}
//             </TableBody>
//          </Table>
//       </TableContainer>
//    );
// };

// export default gradingPage;