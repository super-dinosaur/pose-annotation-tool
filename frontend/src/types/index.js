/**
 * Type definitions for the application
 * Using JSDoc for type safety without TypeScript
 */

/**
 * @typedef {Object} Keypoint
 * @property {number} id - Keypoint ID
 * @property {string} name - Keypoint name
 * @property {string} color - Keypoint color
 */

/**
 * @typedef {Object} Position
 * @property {number} x - X coordinate
 * @property {number} y - Y coordinate
 */

/**
 * @typedef {Object} Person
 * @property {string} id - Person ID
 * @property {string} name - Person name
 * @property {string} color - Person color
 */

/**
 * @typedef {Object} VideoInfo
 * @property {number} width - Video width
 * @property {number} height - Video height
 * @property {number} duration - Video duration in seconds
 * @property {number} frameRate - Video frame rate
 */

/**
 * @typedef {Object.<string, Position>} PersonAnnotations
 * Keypoint ID -> Position mapping for a person
 */

/**
 * @typedef {Object.<string, PersonAnnotations>} FrameAnnotations
 * Person ID -> PersonAnnotations mapping for a frame
 */

/**
 * @typedef {Object.<string, FrameAnnotations>} Annotations
 * Frame key -> FrameAnnotations mapping
 */

/**
 * @typedef {Object} AnnotationState
 * @property {Annotations} annotations - All annotations data
 * @property {Person[]} persons - List of persons
 * @property {string|null} selectedPersonId - Currently selected person ID
 * @property {Keypoint|null} selectedKeypoint - Currently selected keypoint
 * @property {number} currentFrame - Current frame index
 */

/**
 * @typedef {Object} VideoState
 * @property {string|null} videoSrc - Video source URL
 * @property {string} videoName - Video file name
 * @property {VideoInfo} videoInfo - Video information
 * @property {number} currentFrame - Current frame index
 * @property {number} totalFrames - Total number of frames
 * @property {string|null} frameImage - Current frame image data URL
 * @property {boolean} isLoading - Whether video is loading
 * @property {number} scale - Display scale factor
 */

/**
 * @typedef {Object} UIState
 * @property {string} activeTab - Currently active tab
 * @property {boolean} isAddPersonModalVisible - Whether add person modal is visible
 * @property {string} newPersonName - New person name input
 * @property {boolean} isInferencing - Whether inference is in progress
 */

export {};
