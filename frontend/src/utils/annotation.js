/**
 * Annotation utility functions
 */

import { KEYPOINTS } from '../constants';

/**
 * Keypoint ID to English name mapping
 */
const KEYPOINT_ID_TO_NAME = {
  0: 'Nose',
  1: 'LeftEye',
  2: 'RightEye', 
  3: 'LeftEar',
  4: 'RightEar',
  5: 'LeftShoulder',
  6: 'RightShoulder',
  7: 'LeftElbow',
  8: 'RightElbow',
  9: 'LeftWrist',
  10: 'RightWrist',
  11: 'LeftHip',
  12: 'RightHip',
  13: 'LeftKnee',
  14: 'RightKnee',
  15: 'LeftAnkle',
  16: 'RightAnkle'
};

/**
 * Generate unique person ID
 * @param {import('../types').Person[]} persons - Existing persons
 * @returns {string} Unique person ID
 */
export const generatePersonId = (persons) => {
  const maxId = persons.reduce((max, person) => {
    const personIdNum = parseInt(person.id, 10);
    return isNaN(personIdNum) ? max : Math.max(max, personIdNum);
  }, 0);
  
  return String(maxId + 1);
};

/**
 * Generate unique person name
 * @param {string} baseName - Base name
 * @param {import('../types').Person[]} persons - Existing persons
 * @returns {string} Unique person name
 */
export const generateUniqueName = (baseName, persons) => {
  const existingNames = persons.map(p => p.name.toLowerCase());
  
  if (!existingNames.includes(baseName.toLowerCase())) {
    return baseName;
  }
  
  let counter = 1;
  let uniqueName = `${baseName}_${counter}`;
  
  while (existingNames.includes(uniqueName.toLowerCase())) {
    counter++;
    uniqueName = `${baseName}_${counter}`;
  }
  
  return uniqueName;
};

/**
 * Get next keypoint in sequence
 * @param {import('../types').Keypoint} currentKeypoint - Current keypoint
 * @returns {import('../types').Keypoint|null} Next keypoint
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
 * Check if person has annotations in current frame
 * @param {import('../types').Annotations} annotations - All annotations
 * @param {string} personId - Person ID
 * @param {number} frameIndex - Frame index
 * @returns {boolean} Whether person has annotations
 */
export const hasPersonAnnotations = (annotations, personId, frameIndex) => {
  const frameKey = `frame_${frameIndex}`;
  const frameAnnotations = annotations[frameKey];
  
  return frameAnnotations && frameAnnotations[personId] && 
         Object.keys(frameAnnotations[personId]).length > 0;
};

/**
 * Get annotation statistics
 * @param {import('../types').Annotations} annotations - All annotations
 * @param {import('../types').Person[]} persons - All persons
 * @returns {Object} Statistics object
 */
export const getAnnotationStats = (annotations, persons) => {
  const totalFrames = Object.keys(annotations).length;
  const totalPersons = persons.length;
  
  let totalKeypoints = 0;
  let annotatedFrames = 0;
  
  Object.values(annotations).forEach(frameData => {
    let frameHasAnnotations = false;
    
    Object.values(frameData).forEach(personData => {
      const keypointCount = Object.keys(personData).length;
      if (keypointCount > 0) {
        totalKeypoints += keypointCount;
        frameHasAnnotations = true;
      }
    });
    
    if (frameHasAnnotations) {
      annotatedFrames++;
    }
  });
  
  return {
    totalFrames,
    annotatedFrames,
    totalPersons,
    totalKeypoints,
    completionRate: totalFrames > 0 ? (annotatedFrames / totalFrames) * 100 : 0
  };
};

/**
 * Transform annotations for export
 * @param {import('../types').Annotations} annotations - Raw annotations
 * @param {import('../types').Person[]} persons - Persons data
 * @returns {Object} Transformed annotations
 */
export const transformAnnotationsForExport = (annotations, persons) => {
  const personIdMap = {};
  const transformedPersons = {};
  
  // Create person mapping
  persons.forEach(person => {
    const exportId = `${person.name.replace(/\s+/g, '_').toLowerCase()}_${person.id}`;
    personIdMap[person.id] = exportId;
    transformedPersons[exportId] = {
      name: person.name,
      color: person.color
    };
  });
  
  // Transform annotations
  const transformedAnnotations = {};
  
  Object.entries(annotations).forEach(([frameKey, frameData]) => {
    transformedAnnotations[frameKey] = {};
    
    Object.entries(frameData).forEach(([personId, personData]) => {
      const newPersonId = personIdMap[personId] || personId;
      transformedAnnotations[frameKey][newPersonId] = {};
      
      Object.entries(personData).forEach(([keypointId, position]) => {
        const keypointName = KEYPOINT_ID_TO_NAME[keypointId] || keypointId;
        transformedAnnotations[frameKey][newPersonId][keypointName] = position;
      });
    });
  });
  
  return {
    persons: transformedPersons,
    annotations: transformedAnnotations
  };
};

/**
 * Clean up empty frames from annotations
 * @param {import('../types').Annotations} annotations - Annotations to clean
 * @returns {import('../types').Annotations} Cleaned annotations
 */
export const cleanupAnnotations = (annotations) => {
  const cleaned = {};
  
  Object.entries(annotations).forEach(([frameKey, frameData]) => {
    const hasData = Object.values(frameData).some(personData => 
      Object.keys(personData).length > 0
    );
    
    if (hasData) {
      cleaned[frameKey] = frameData;
    }
  });
  
  return cleaned;
};
