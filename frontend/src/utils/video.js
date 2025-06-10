/**
 * Video utility functions
 */

/**
 * Calculate appropriate scale factor for video display
 * @param {number} videoWidth - Video width
 * @param {number} videoHeight - Video height  
 * @param {number} containerWidth - Container width
 * @param {number} containerHeight - Container height
 * @returns {number} Scale factor
 */
export const calculateScaleFactor = (videoWidth, videoHeight, containerWidth, containerHeight, mode = 'fit') => {
  if (!videoWidth || !videoHeight || !containerWidth || !containerHeight) {
    return 1;
  }
  
  const widthScale = containerWidth / videoWidth;
  const heightScale = containerHeight / videoHeight;
  
  // 'fit' mode: maintain aspect ratio and fit within container
  // 'fill' mode: maintain aspect ratio and fill container (may crop)
  // 'stretch': ignore aspect ratio and fill container exactly
  switch(mode) {
    case 'fill':
      return Math.max(widthScale, heightScale);
    case 'stretch':
      return { width: widthScale, height: heightScale };
    case 'fit':
    default:
      return Math.min(widthScale, heightScale);
  }
};

/**
 * Calculate total frames from duration and frame rate
 * @param {number} duration - Video duration in seconds
 * @param {number} frameRate - Frame rate
 * @returns {number} Total frames
 */
export const calculateTotalFrames = (duration, frameRate) => {
  return Math.floor(duration * frameRate);
};

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
    
    videoElement.currentTime = frameIndex / frameRate;
    
    videoElement.onseeked = () => {
      try {
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        ctx.drawImage(videoElement, 0, 0, videoElement.videoWidth, videoElement.videoHeight);
        
        const dataUrl = canvas.toDataURL('image/jpeg');
        resolve(dataUrl);
      } catch (error) {
        reject(error);
      }
    };
    
    videoElement.onerror = (error) => {
      reject(error);
    };
  });
};

/**
 * Format frame key
 * @param {number} frameIndex - Frame index
 * @returns {string} Frame key
 */
export const formatFrameKey = (frameIndex) => `frame_${frameIndex}`;

/**
 * Parse frame key to get frame index
 * @param {string} frameKey - Frame key
 * @returns {number} Frame index
 */
export const parseFrameKey = (frameKey) => {
  const match = frameKey.match(/^frame_(\d+)$/);
  return match ? parseInt(match[1], 10) : 0;
};
