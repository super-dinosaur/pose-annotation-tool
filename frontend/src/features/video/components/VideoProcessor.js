/**
 * Video processor component - handles all video loading and frame extraction
 */

import { useEffect } from 'react';
import { useVideoFrame } from '../hooks/useVideoFrame';

/**
 * VideoProcessor component
 * This component doesn't render anything, just handles video processing
 */
export const VideoProcessor = () => {
  const { isLoading } = useVideoFrame();
  
  useEffect(() => {
    console.log('[VideoProcessor] Video loading state:', isLoading);
  }, [isLoading]);
  
  // This component doesn't render anything
  return null;
};

export default VideoProcessor;
