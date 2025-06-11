/**
 * Human keypoint definitions
 * @type {import('../types').Keypoint[]}
 */
export const KEYPOINTS = [
  { id: 0, name: "nose", color: "#ff0000" },
  { id: 1, name: "left eye", color: "#ff4500" },
  { id: 2, name: "right eye", color: "#ff4500" },
  { id: 3, name: "left ear", color: "#ff8c00" },
  { id: 4, name: "right ear", color: "#ff8c00" },
  { id: 5, name: "left shoulder", color: "#ffd700" },
  { id: 6, name: "right shoulder", color: "#ffd700" },
  { id: 7, name: "left elbow", color: "#90ee90" },
  { id: 8, name: "right elbow", color: "#90ee90" },
  { id: 9, name: "left wrist", color: "#00ced1" },
  { id: 10, name: "right wrist", color: "#00ced1" },
  { id: 11, name: "left hip", color: "#1e90ff" },
  { id: 12, name: "right hip", color: "#1e90ff" },
  { id: 13, name: "left knee", color: "#9370db" },
  { id: 14, name: "right knee", color: "#9370db" },
  { id: 15, name: "left ankle", color: "#8a2be2" },
  { id: 16, name: "right ankle", color: "#8a2be2" },
];

/**
 * Skeleton connection definitions
 * @type {number[][]}
 */
export const SKELETON_CONNECTIONS = [
  [0, 1],
  [0, 2],
  [1, 3],
  [2, 4], // Head
  [3, 5],
  [4, 6], // Ears to shoulders
  [5, 6], // Shoulders
  [5, 7],
  [7, 9], // Left arm
  [6, 8],
  [8, 10], // Right arm
  [5, 11],
  [6, 12], // Torso
  [11, 12], // Torso
  [11, 13],
  [13, 15], // Left leg
  [12, 14],
  [14, 16], // Right leg
];

/**
 * Default person colors
 * @type {string[]}
 */
export const PERSON_COLORS = [
  "#ff3838", // Red
  "#3877ff", // Blue
  "#38ff38", // Green
  "#ff38ff", // Purple
  "#ffb738", // Orange
  "#38ffff", // Cyan
  "#ff9c9c", // Pink
  "#9c9cff", // Light blue
];

/**
 * Visual constants
 */
export const VISUAL_CONSTANTS = {
  SKELETON_COLOR: "#00ff00",
  KEYPOINT_RADIUS: 6,
  KEYPOINT_STROKE: "#ffffff",
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
    ADD_PERSON: "ctrl+n",
    SWITCH_TAB: "tab",
    NEXT_FRAME: "arrowright",
    PREV_FRAME: "arrowleft",
    SAVE: "ctrl+s",
  },
};

/**
 * Tab names
 */
export const TABS = {
  PERSONS: "persons",
  KEYPOINTS: "keypoints",
  VIDEO_INFO: "videoinfo",
};
