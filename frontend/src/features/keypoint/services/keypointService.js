/**
 * Keypoint service functions
 */

import { KEYPOINTS } from '../../../constants';

/**
 * Get keypoint by ID
 * @param {number} keypointId - Keypoint ID
 * @returns {import('../../../types').Keypoint|null} Found keypoint or null
 */
export const getKeypointById = (keypointId) => {
  return KEYPOINTS.find(kp => kp.id === keypointId) || null;
};

/**
 * Get next keypoint in sequence
 * @param {import('../../../types').Keypoint} currentKeypoint - Current keypoint
 * @returns {import('../../../types').Keypoint|null} Next keypoint
 */
export const getNextKeypoint = (currentKeypoint) => {
  if (!currentKeypoint) return KEYPOINTS[0];
  
  const currentIndex = KEYPOINTS.findIndex(kp => kp.id === currentKeypoint.id);
  
  if (currentIndex >= 0 && currentIndex < KEYPOINTS.length - 1) {
    return KEYPOINTS[currentIndex + 1];
  } else if (currentIndex === KEYPOINTS.length - 1) {
    return KEYPOINTS[0]; // Loop back to first
  }
  
  return null;
};

/**
 * Get previous keypoint in sequence
 * @param {import('../../../types').Keypoint} currentKeypoint - Current keypoint
 * @returns {import('../../../types').Keypoint|null} Previous keypoint
 */
export const getPrevKeypoint = (currentKeypoint) => {
  if (!currentKeypoint) return KEYPOINTS[KEYPOINTS.length - 1];
  
  const currentIndex = KEYPOINTS.findIndex(kp => kp.id === currentKeypoint.id);
  
  if (currentIndex > 0) {
    return KEYPOINTS[currentIndex - 1];
  } else if (currentIndex === 0) {
    return KEYPOINTS[KEYPOINTS.length - 1]; // Loop to last
  }
  
  return null;
};

/**
 * Validate keypoint position
 * @param {import('../../../types').Position} position - Position to validate
 * @param {number} imageWidth - Image width
 * @param {number} imageHeight - Image height
 * @returns {Object} Validation result
 */
export const validateKeypointPosition = (position, imageWidth, imageHeight) => {
  if (!position || typeof position.x !== 'number' || typeof position.y !== 'number') {
    return {
      isValid: false,
      error: 'Position must have numeric x and y coordinates'
    };
  }
  
  if (position.x < 0 || position.x > imageWidth || position.y < 0 || position.y > imageHeight) {
    return {
      isValid: false,
      error: 'Position is outside image bounds'
    };
  }
  
  return {
    isValid: true,
    error: null
  };
};
