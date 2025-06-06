/**
 * Annotation service functions
 */

import { formatFrameKey } from '../../../utils/video';

/**
 * Add annotation to data structure
 * @param {import('../../../types').Annotations} annotations - Current annotations
 * @param {number} frameIndex - Frame index
 * @param {string} personId - Person ID
 * @param {number} keypointId - Keypoint ID
 * @param {import('../../../types').Position} position - Position
 * @returns {import('../../../types').Annotations} Updated annotations
 */
export const addAnnotation = (annotations, frameIndex, personId, keypointId, position) => {
  const frameKey = formatFrameKey(frameIndex);
  
  return {
    ...annotations,
    [frameKey]: {
      ...annotations[frameKey],
      [personId]: {
        ...annotations[frameKey]?.[personId],
        [keypointId]: position,
      },
    },
  };
};

/**
 * Remove annotation from data structure
 * @param {import('../../../types').Annotations} annotations - Current annotations
 * @param {number} frameIndex - Frame index
 * @param {string} personId - Person ID
 * @param {number} keypointId - Keypoint ID
 * @returns {import('../../../types').Annotations} Updated annotations
 */
export const removeAnnotation = (annotations, frameIndex, personId, keypointId) => {
  const frameKey = formatFrameKey(frameIndex);
  const frameAnnotations = annotations[frameKey];
  
  if (!frameAnnotations || !frameAnnotations[personId]) {
    return annotations;
  }
  
  const { [keypointId]: removed, ...remainingKeypoints } = frameAnnotations[personId];
  
  if (Object.keys(remainingKeypoints).length === 0) {
    // Remove person if no keypoints left
    const { [personId]: removedPerson, ...remainingPersons } = frameAnnotations;
    
    if (Object.keys(remainingPersons).length === 0) {
      // Remove frame if no persons left
      const { [frameKey]: removedFrame, ...remainingFrames } = annotations;
      return remainingFrames;
    }
    
    return {
      ...annotations,
      [frameKey]: remainingPersons,
    };
  }
  
  return {
    ...annotations,
    [frameKey]: {
      ...frameAnnotations,
      [personId]: remainingKeypoints,
    },
  };
};

/**
 * Get annotations for specific frame and person
 * @param {import('../../../types').Annotations} annotations - All annotations
 * @param {number} frameIndex - Frame index
 * @param {string} personId - Person ID
 * @returns {Object} Person annotations for frame
 */
export const getPersonAnnotationsForFrame = (annotations, frameIndex, personId) => {
  const frameKey = formatFrameKey(frameIndex);
  const frameAnnotations = annotations[frameKey];
  
  return frameAnnotations?.[personId] || {};
};

/**
 * Check if frame has any annotations
 * @param {import('../../../types').Annotations} annotations - All annotations
 * @param {number} frameIndex - Frame index
 * @returns {boolean} Whether frame has annotations
 */
export const frameHasAnnotations = (annotations, frameIndex) => {
  const frameKey = formatFrameKey(frameIndex);
  const frameAnnotations = annotations[frameKey];
  
  if (!frameAnnotations) return false;
  
  return Object.values(frameAnnotations).some(personData => 
    Object.keys(personData).length > 0
  );
};

/**
 * Get all frames with annotations
 * @param {import('../../../types').Annotations} annotations - All annotations
 * @returns {number[]} Array of frame indices with annotations
 */
export const getAnnotatedFrames = (annotations) => {
  return Object.keys(annotations)
    .map(frameKey => parseInt(frameKey.replace('frame_', ''), 10))
    .filter(frameIndex => !isNaN(frameIndex))
    .sort((a, b) => a - b);
};

/**
 * Copy annotations from one frame to another
 * @param {import('../../../types').Annotations} annotations - Current annotations
 * @param {number} sourceFrame - Source frame index
 * @param {number} targetFrame - Target frame index
 * @returns {import('../../../types').Annotations} Updated annotations
 */
export const copyFrameAnnotations = (annotations, sourceFrame, targetFrame) => {
  const sourceKey = formatFrameKey(sourceFrame);
  const targetKey = formatFrameKey(targetFrame);
  const sourceData = annotations[sourceKey];
  
  if (!sourceData) return annotations;
  
  return {
    ...annotations,
    [targetKey]: { ...sourceData },
  };
};
