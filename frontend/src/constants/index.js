/**
 * Human keypoint definitions
 * @type {import('../types').Keypoint[]}
 */
export const KEYPOINTS = [
  { id: 0, name: '鼻子', color: '#ff0000' },
  { id: 1, name: '左眼', color: '#ff4500' },
  { id: 2, name: '右眼', color: '#ff4500' },
  { id: 3, name: '左耳', color: '#ff8c00' },
  { id: 4, name: '右耳', color: '#ff8c00' },
  { id: 5, name: '左肩', color: '#ffd700' },
  { id: 6, name: '右肩', color: '#ffd700' },
  { id: 7, name: '左肘', color: '#90ee90' },
  { id: 8, name: '右肘', color: '#90ee90' },
  { id: 9, name: '左腕', color: '#00ced1' },
  { id: 10, name: '右腕', color: '#00ced1' },
  { id: 11, name: '左髋', color: '#1e90ff' },
  { id: 12, name: '右髋', color: '#1e90ff' },
  { id: 13, name: '左膝', color: '#9370db' },
  { id: 14, name: '右膝', color: '#9370db' },
  { id: 15, name: '左踝', color: '#8a2be2' },
  { id: 16, name: '右踝', color: '#8a2be2' },
];

/**
 * Skeleton connection definitions
 * @type {number[][]}
 */
export const SKELETON_CONNECTIONS = [
  [0, 1], [0, 2], [1, 3], [2, 4], // Head
  [3, 5], [4, 6], // Ears to shoulders
  [5, 6], // Shoulders
  [5, 7], [7, 9], // Left arm
  [6, 8], [8, 10], // Right arm
  [5, 11], [6, 12], // Torso
  [11, 12], // Torso
  [11, 13], [13, 15], // Left leg
  [12, 14], [14, 16], // Right leg
];

/**
 * Default person colors
 * @type {string[]}
 */
export const PERSON_COLORS = [
  '#ff3838', // Red
  '#3877ff', // Blue
  '#38ff38', // Green
  '#ff38ff', // Purple
  '#ffb738', // Orange
  '#38ffff', // Cyan
  '#ff9c9c', // Pink
  '#9c9cff', // Light blue
];

/**
 * Visual constants
 */
export const VISUAL_CONSTANTS = {
  SKELETON_COLOR: '#00ff00',
  KEYPOINT_RADIUS: 6,
  KEYPOINT_STROKE: '#ffffff',
  KEYPOINT_STROKE_WIDTH: 2,
  SKELETON_LINE_WIDTH: 2,
};

/**
 * Application constants
 */
export const APP_CONSTANTS = {
  DEFAULT_VIDEO_FRAME_RATE: 30,
  MAX_PERSONS: 20,
  KEYBOARD_SHORTCUTS: {
    ADD_PERSON: 'ctrl+n',
    SWITCH_TAB: 'tab',
    NEXT_FRAME: 'arrowright',
    PREV_FRAME: 'arrowleft',
    SAVE: 'ctrl+s',
  },
};

/**
 * Tab names
 */
export const TABS = {
  PERSONS: 'persons',
  KEYPOINTS: 'keypoints',
  VIDEO_INFO: 'videoinfo',
};
