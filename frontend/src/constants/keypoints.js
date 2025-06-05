/**
 * 人体关键点定义
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
 * 骨架连接定义
 */
export const SKELETON_CONNECTIONS = [
  [0, 1], [0, 2], [1, 3], [2, 4], // 头部
  [3, 5], [4, 6], // 耳朵到肩膀的连接
  [5, 6], // 肩膀
  [5, 7], [7, 9], // 左臂
  [6, 8], [8, 10], // 右臂
  [5, 11], [6, 12], // 躯干
  [11, 12], // 躯干
  [11, 13], [13, 15], // 左腿
  [12, 14], [14, 16], // 右腿
];

/**
 * 默认人物颜色列表
 */
export const PERSON_COLORS = [
  '#ff3838', // 红色
  '#3877ff', // 蓝色
  '#38ff38', // 绿色
  '#ff38ff', // 紫色
  '#ffb738', // 橙色
  '#38ffff', // 青色
  '#ff9c9c', // 粉红色
  '#9c9cff', // 淡蓝色
];

/**
 * 骨架连接线颜色
 */
export const SKELETON_COLOR = '#00ff00';

/**
 * 关键点半径
 */
export const KEYPOINT_RADIUS = 6;

/**
 * 关键点边框颜色
 */
export const KEYPOINT_STROKE = '#ffffff';

/**
 * 关键点边框宽度
 */
export const KEYPOINT_STROKE_WIDTH = 2; 