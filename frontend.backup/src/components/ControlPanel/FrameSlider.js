import React from 'react';
import { Slider, Button } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import './FrameSlider.css';

/**
 * 帧滑块组件
 * @param {Object} props - 组件属性
 * @param {number} props.currentFrame - 当前帧索引
 * @param {number} props.totalFrames - 总帧数
 * @param {Function} props.onPrevFrame - 上一帧回调
 * @param {Function} props.onNextFrame - 下一帧回调
 * @param {Function} props.onFrameChange - 帧变化回调
 * @param {Object} props.annotations - 标注数据
 * @returns {JSX.Element} - 返回帧滑块组件
 */
const FrameSlider = ({ 
  currentFrame, 
  totalFrames, 
  onPrevFrame, 
  onNextFrame, 
  onFrameChange,
  annotations 
}) => {
  // 获取已标注的帧
  const getAnnotatedFrames = () => {
    return Object.keys(annotations)
      .filter(key => key.startsWith('frame_'))
      .map(key => parseInt(key.replace('frame_', '')));
  };
  
  // 自定义滑块提示
  const tipFormatter = (value) => {
    const frameKey = `frame_${value}`;
    const isAnnotated = !!annotations[frameKey];
    return (
      <div>
        帧 {value + 1} {isAnnotated ? '(已标注)' : ''}
      </div>
    );
  };

  return (
    <div className="frame-slider">
      <Button 
        icon={<LeftOutlined />} 
        onClick={onPrevFrame} 
        disabled={currentFrame === 0}
      />
      
      <Slider
        className="frame-progress"
        min={0}
        max={totalFrames - 1}
        value={currentFrame}
        onChange={onFrameChange}
        tooltip={{ formatter: tipFormatter }}
        marks={getAnnotatedFrames().reduce((acc, frame) => {
          acc[frame] = { style: { color: '#52c41a' }, label: '' };
          return acc;
        }, {})}
      />
      
      <Button 
        icon={<RightOutlined />} 
        onClick={onNextFrame} 
        disabled={currentFrame === totalFrames - 1}
      />
      
      <span className="frame-counter">
        {currentFrame + 1} / {totalFrames}
      </span>
    </div>
  );
};

export default FrameSlider; 