// HEADER-START
// * Path: ./src/VideoControlCard.tsx
// HEADER-END

// ./src/VideoControlCard.tsx
'use client';
// ./src/VideoControlCard.tsx
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import {useTheme} from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import * as React from 'react';
import {useRef, useState} from 'react';
import YouTube from 'react-youtube';
type VideoControlCardProps = {
   title: string;
   subtitle: string;
   videoUrl: string;
   altText: string;
};

const VideoControlCard: React.FC<VideoControlCardProps> = ({title, subtitle, videoUrl, altText}) => {
   const theme = useTheme();
   const videoRef = useRef<HTMLVideoElement>(null);
   const [isPlaying, setIsPlaying] = useState(false);

   const opts = {
      height: '400px',
      width: '640px',
      playerVars: {
         // https://developers.google.com/youtube/player_parameters
         autoplay: 1,
      },
   };
   const handlePlayPause = () => {
      if (videoRef.current) {
         if (isPlaying) {
            videoRef.current.pause();
         } else {
            videoRef.current.play();
         }
         setIsPlaying(!isPlaying);
      }
   };

   return (
      <Card
         sx={{
            display: 'flex',
         }}>
         <Box
            sx={{
               display: 'flex',
               flexDirection: 'column',
               flex: '1 0 auto',
            }}>
            <CardContent>
               <Typography component='div' variant='h5'>
                  {title}
               </Typography>
               <Typography variant='subtitle1' color='text.secondary' component='div'>
                  {subtitle}
               </Typography>
            </CardContent>
            {/* <Box sx={{ display: 'flex', alignItems: 'center', pl: 1, pb: 1 }}>
          <IconButton aria-label="previous">
            {theme.direction === 'rtl' ? <SkipNextIcon /> : <SkipPreviousIcon />}
          </IconButton>
          <IconButton aria-label="play/pause" onClick={handlePlayPause}>
            {isPlaying ? <PauseIcon sx={{ height: 38, width: 38 }} /> : <PlayArrowIcon sx={{ height: 38, width: 38 }} />}
          </IconButton>
          <IconButton aria-label="next">
            {theme.direction === 'rtl' ? <SkipPreviousIcon /> : <SkipNextIcon />}
          </IconButton>
        </Box> */}
            <YouTube
               videoId={videoUrl}
               opts={opts}
               onReady={(event: {
                  target: {
                     pauseVideo: () => void;
                  };
               }) => {
                  event.target.pauseVideo();
               }}
            />
            {/* <YouTube videoId={videoUrl} opts={opts} onReady={(event)=>{event.target.pauseVideo();}} style={{width:'200px', height:'200px'}} /> */}
         </Box>
      </Card>
   );
};

export default VideoControlCard;
