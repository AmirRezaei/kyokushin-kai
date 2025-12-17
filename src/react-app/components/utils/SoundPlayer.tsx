// HEADER-START
// * Project: Kyokushin
// * Path: src/components/utils/SoundPlayer.tsx
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
import {forwardRef, useEffect, useImperativeHandle, useRef, useState} from 'react';
import * as Tone from 'tone';

import {base64MetronomeWav} from '@/media/media';

export interface SoundPlayerHandle {
   playSound: () => void;
   stopSound: () => void;
   startLoop: (bpm: number) => void;
   stopLoop: () => void;
   setBPM: (steps: number) => void;
   setPitch: (semitones: number) => void;
   isPlaying: boolean;
   getBPMSteps?: () => number;
   getPitchSteps?: () => number;
}

interface SoundPlayerProps {
   volume?: number; // Optional volume level (0 to 1)
   playOnLoad?: boolean; // Automatically play when the component mounts
}

export const SoundPlayer = forwardRef<SoundPlayerHandle, SoundPlayerProps>(({volume = 1.0}, ref) => {
   const playerRef = useRef<Tone.Player | null>(null);
   const loopRef = useRef<Tone.Loop | null>(null);
   const pitchShiftRef = useRef<Tone.PitchShift | null>(null);
   const [isPlaying, setIsPlaying] = useState(false);
   const [isLooping, setIsLooping] = useState(false);
   const [bpmSteps, setBpmSteps] = useState(0); // ±6 steps
   const [pitchSteps, setPitchSteps] = useState(0); // ±6 semitones

   const maxSteps = 6;
   const minSteps = -6;

   useEffect(() => {
      // Initialize Tone.js Player without direct connection
      const base64Audio = `data:audio/wav;base64,${base64MetronomeWav}`;
      playerRef.current = new Tone.Player(base64Audio, () => {
         console.log('Audio loaded');
      });

      // Initialize PitchShift and connect to the player
      pitchShiftRef.current = new Tone.PitchShift();
      playerRef.current.connect(pitchShiftRef.current).toDestination(); // Only through PitchShift

      // Initialize volume
      if (playerRef.current) {
         playerRef.current.volume.value = Tone.gainToDb(volume);
      }

      return () => {
         stopSound();
         if (playerRef.current) {
            playerRef.current.dispose();
            playerRef.current = null;
         }
         if (pitchShiftRef.current) {
            pitchShiftRef.current.dispose();
            pitchShiftRef.current = null;
         }
         if (loopRef.current) {
            loopRef.current.dispose();
            loopRef.current = null;
         }
         Tone.Transport.stop();
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   const playSound = async () => {
      if (Tone.context.state === 'suspended') {
         await Tone.start();
      }

      playerRef.current?.start();
      setIsPlaying(true);

      if (playerRef.current) {
         playerRef.current.onstop = () => {
            setIsPlaying(false);
            if (isLooping) {
               playSound();
            }
         };
      }
   };

   const stopSound = () => {
      playerRef.current?.stop();
      setIsPlaying(false);
   };

   const startLoop = async (bpm: number) => {
      if (isLooping) stopLoop();

      if (Tone.context.state === 'suspended') {
         await Tone.start();
      }

      Tone.Transport.bpm.value = bpm;

      loopRef.current = new Tone.Loop(() => {
         playSound();
      }, '1m').start(0);

      Tone.Transport.start();
      setIsLooping(true);
   };

   const stopLoop = () => {
      if (loopRef.current) {
         loopRef.current.stop();
         loopRef.current.dispose();
         loopRef.current = null;
      }
      Tone.Transport.stop();
      setIsLooping(false);
      stopSound();
   };

   const setBPM = (steps: number) => {
      const clampedSteps = Math.max(minSteps, Math.min(maxSteps, steps));
      setBpmSteps(clampedSteps);
      const newBPM = Tone.Transport.bpm.value + clampedSteps * 5; // Each step changes BPM by 5
      Tone.Transport.bpm.value = newBPM;
   };

   const setPitch = (semitones: number) => {
      const clampedSemitones = Math.max(minSteps, Math.min(maxSteps, semitones));
      setPitchSteps(clampedSemitones);
      if (pitchShiftRef.current) {
         pitchShiftRef.current.pitch = clampedSemitones;
      }
   };

   useImperativeHandle(ref, () => ({
      playSound,
      stopSound,
      startLoop,
      stopLoop,
      setBPM,
      setPitch,
      isPlaying,
      getBPMSteps: () => bpmSteps,
      getPitchSteps: () => pitchSteps,
   }));

   return null; // This component does not render anything visible
});

SoundPlayer.displayName = 'SoundPlayer';
