// HEADER-START
// * Project: Kyokushin
// * Path: src/components/Timer/MetronomePlayer.tsx
// ! Purpose: [Action Required: Summarize the component or file purpose.]
//
// ! Tech Stack and Libraries:
// - Core Frameworks: React, Vite
// - UI/Styling: MUI v6, MUI X-Charts, MUI X Data Grid, MUI X Date and Time Pickers, MUI X Tree View, TailwindCSS
// - TypeScript: Strict Mode Enabled
// - Package Manager: Yarn
//
// ? Additional Libraries:
// - Drag-and-Drop: @dnd-kit/core, @dnd-kit/sortable
// - Utilities: Lodash, UUID, date-fns, tone
// - Data Handling: XLSX, react-papaparse
// - Icons: MUI Icons, React Icons
// - Routing: React Router DOM
//
// ! Development Environment:
// - OS: Windows
// - Tools: PowerShell, VSCode
//
// ! Coding Guidelines:
// 1. Purpose Summary: Provide a concise description of the file's role based on the "Purpose" section.
// 2. Code Quality: Ensure code is readable, maintainable, and optimized for performance.
// 3. State Management: Use immutable state updates and minimize state where possible.
// 4. Rendering Optimization: Utilize React.memo, useCallback, and useMemo to optimize rendering efficiency.
// 5. State Management Libraries: Avoid prop drilling by leveraging Context API or state management libraries.
// 6. Side Effects Management:
//    - Ensure useEffect hooks are idempotent and handle multiple invocations gracefully, especially under React Strict Mode.
//    - Clean up side effects in useEffect and manage dependencies carefully.
//    - Use centralize side-effect operations (e.g., localStorage interactions) to maintain data integrity and ease debugging.
//      - Use utility functions 'getLocalStorageItem' and 'setLocalStorageItem' located at @/components/utils/localStorageUtils.ts.
//        - Function Signatures:
//          - 'const getLocalStorageItem = <T,>(key: string, defaultValue: T): T'
//          - 'const setLocalStorageItem = <T,>(key: string, value: T): void'
// 7. Modularization: Break down large components into smaller, reusable parts.
// 8. Semantic HTML & Styling: Use semantic HTML elements and modular styling approaches (e.g., CSS modules, TailwindCSS).
// 9. Error Handling:
//    - Implement robust error handling.
//    - Provide user-friendly feedback in case of errors.
// 10. Reactive State: Utilize useState or useRef for reactive state management; avoid using global variables.
// 11. Security: Identify and mitigate potential security vulnerabilities (e.g., XSS, injection attacks).
// 12. Code Conciseness: Ensure all generated code is concise and excludes this header.
// 13. This app is a static site with client-side rendering (CSR) where all pages are pre-generated during the build and directly loaded into the browser (e.g., hosted on a static file server or CDN).
// 14. Avoid Duplicate Rendering during development builds due to React Strict Mode.
// HEADER-END
import {Button, Grid, Typography} from '@mui/material';
import React, {useCallback, useEffect, useRef} from 'react';
import * as Tone from 'tone';

import {SoundPlayer, SoundPlayerHandle} from '@/components/utils/SoundPlayer';

interface MetronomeControlsProps {
   isPlaying: boolean;
   setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
   tempo: number;
}

export const MetronomePlayer: React.FC<MetronomeControlsProps> = React.memo(({isPlaying, setIsPlaying, tempo}) => {
   const regularTickRef = useRef<SoundPlayerHandle>(null);
   const accentTickRef = useRef<SoundPlayerHandle>(null);
   const tickCountRef = useRef<number>(0);
   const loopRef = useRef<Tone.Loop | null>(null);

   // Callback to play ticks with proper accentuation
   const playTick = useCallback(() => {
      const isAccent = tickCountRef.current % 2 === 0; // Accentuate every 4th tick
      if (isAccent) {
         accentTickRef.current?.playSound();
      } else {
         regularTickRef.current?.playSound();
      }
      tickCountRef.current += 1;
   }, []);

   // Start the metronome using Tone.js scheduling
   const startMetronome = useCallback(async () => {
      try {
         await Tone.start(); // Ensure AudioContext is started

         // Reset the tick count
         tickCountRef.current = 0;

         // Set the BPM of the transport
         Tone.Transport.bpm.value = tempo;

         // Create a loop to schedule ticks
         loopRef.current = new Tone.Loop(() => {
            playTick();
         }, '4n'); // Every quarter note

         loopRef.current.start(0);
         Tone.Transport.start();
         setIsPlaying(true);
      } catch (error) {
         console.error('Failed to start the audio context:', error);
         alert('Audio context could not start. Please interact with the page to allow audio playback.');
      }
   }, [playTick, setIsPlaying, tempo]);

   // Stop the metronome and clean up resources
   const stopMetronome = useCallback(() => {
      if (loopRef.current) {
         loopRef.current.stop();
         loopRef.current.cancel();
         loopRef.current.dispose();
         loopRef.current = null;
      }
      Tone.Transport.stop();
      setIsPlaying(false);
   }, [setIsPlaying]);

   // Update BPM in real-time when tempo changes
   useEffect(() => {
      if (isPlaying) {
         Tone.Transport.bpm.rampTo(tempo, 0.1); // Smooth transition over 0.1 seconds
      } else {
         Tone.Transport.bpm.value = tempo;
      }
   }, [tempo, isPlaying]);

   // Clean up on component unmount
   useEffect(() => {
      return () => {
         stopMetronome();
      };
   }, [stopMetronome]);

   // Initialize tick sounds and pitches
   useEffect(() => {
      regularTickRef.current?.setPitch(6); // Regular tick pitch
      accentTickRef.current?.setPitch(0); // Accent tick pitch
   }, []);

   return (
      <Grid container direction='column' alignItems='center' spacing={2}>
         <Grid item>
            <Typography align='center' gutterBottom>
               Current Tempo: {tempo} BPM
            </Typography>
         </Grid>
         <Grid item>
            <Button variant='contained' color={isPlaying ? 'error' : 'primary'} onClick={isPlaying ? stopMetronome : startMetronome} fullWidth>
               {isPlaying ? 'Stop' : 'Start'} Metronome
            </Button>
         </Grid>
         {/* SoundPlayer Components */}
         <SoundPlayer ref={regularTickRef} volume={1.0} playOnLoad={false} />
         <SoundPlayer ref={accentTickRef} volume={1.0} playOnLoad={false} />
      </Grid>
   );
});

MetronomePlayer.displayName = 'MetronomePlayer';
