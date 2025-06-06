/**
 * Video service for handling video operations
 */

import { calculateTotalFrames as utilCalculateTotalFrames } from '../../../utils/video';

/**
 * Extract frame from video element
 * @param {HTMLVideoElement} videoElement - Video element
 * @param {number} frameIndex - Frame index
 * @param {number} frameRate - Frame rate
 * @returns {Promise<string>} Frame image data URL
 */
export const extractFrameFromVideo = (videoElement, frameIndex, frameRate) => {
  return new Promise((resolve, reject) => {
    if (!videoElement) {
      reject(new Error('Video element not found'));
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // For the first frame, we can draw immediately without seeking
    if (frameIndex === 0) {
      try {
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        ctx.drawImage(videoElement, 0, 0, videoElement.videoWidth, videoElement.videoHeight);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        resolve(dataUrl);
        return;
      } catch (error) {
        reject(error);
        return;
      }
    }
    
    // For other frames, seek to the specific time
    const targetTime = frameIndex / frameRate;
    videoElement.currentTime = targetTime;
    
    const handleSeeked = () => {
      try {
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        ctx.drawImage(videoElement, 0, 0, videoElement.videoWidth, videoElement.videoHeight);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        resolve(dataUrl);
      } catch (error) {
        reject(error);
      } finally {
        videoElement.removeEventListener('seeked', handleSeeked);
      }
    };
    
    videoElement.addEventListener('seeked', handleSeeked);
    
    // Fallback timeout
    setTimeout(() => {
      videoElement.removeEventListener('seeked', handleSeeked);
      reject(new Error('Frame extraction timeout'));
    }, 5000);
  });
};

/**
 * Calculate total frames from duration and frame rate
 * @param {number} duration - Video duration in seconds
 * @param {number} frameRate - Frame rate
 * @returns {number} Total frames
 */
export const calculateTotalFrames = utilCalculateTotalFrames;

/**
 * Get video metadata
 * @param {string} videoSrc - Video source URL
 * @returns {Promise<Object>} Video metadata
 */
export const getVideoMetadata = (videoSrc) => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.preload = 'metadata';
    
    video.onloadedmetadata = () => {
      const metadata = {
        width: video.videoWidth,
        height: video.videoHeight,
        duration: video.duration,
        // Note: Actual frame rate is hard to get from HTML5 video
        // This is an approximation
        frameRate: 30,
      };
      
      resolve(metadata);
    };
    
    video.onerror = () => {
      reject(new Error('Failed to load video metadata'));
    };
    
    video.src = videoSrc;
  });
};

/**
 * Validate video file
 * @param {File} file - Video file
 * @returns {boolean} Whether file is valid video
 */
export const validateVideoFile = (file) => {
  if (!file) return false;
  
  const validTypes = [
    'video/mp4',
    'video/webm',
    'video/ogg',
    'video/avi',
    'video/mov',
    'video/wmv',
  ];
  
  return validTypes.includes(file.type) || file.type.startsWith('video/');
};

/**
 * Create video URL from file
 * @param {File} file - Video file
 * @returns {string} Video URL
 */
export const createVideoUrl = (file) => {
  return URL.createObjectURL(file);
};

/**
 * Cleanup video URL
 * @param {string} url - Video URL to cleanup
 */
export const cleanupVideoUrl = (url) => {
  if (url && url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
};
