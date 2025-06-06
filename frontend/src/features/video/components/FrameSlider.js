/**
 * Frame slider component for video navigation
 */

import React, { useCallback, useMemo } from 'react';
import { Slider, Button, Tooltip } from 'antd';
import { LeftOutlined, RightOutlined, StepBackwardOutlined, StepForwardOutlined } from '@ant-design/icons';
import { hasPersonAnnotations } from '../../../utils/annotation';
import './FrameSlider.css';

/**
 * FrameSlider component
 * @param {Object} props - Component props
 * @param {number} props.currentFrame - Current frame index
 * @param {number} props.totalFrames - Total frames
 * @param {Function} props.onFrameChange - Callback when frame changes
 * @param {Function} props.onPrevFrame - Callback for previous frame
 * @param {Function} props.onNextFrame - Callback for next frame
 * @param {import('../../../types').Annotations} props.annotations - Annotations data
 * @param {import('../../../types').Person[]} props.persons - Persons data
 * @returns {JSX.Element}
 */
export const FrameSlider = ({ 
  currentFrame, 
  totalFrames, 
  onFrameChange, 
  onPrevFrame, 
  onNextFrame,
  annotations = {},
  persons = []
}) => {
  // Calculate which frames have annotations
  const annotatedFrames = useMemo(() => {
    const frames = new Set();
    
    for (let frameIndex = 0; frameIndex < totalFrames; frameIndex++) {
      const hasAnnotations = persons.some(person => 
        hasPersonAnnotations(annotations, person.id, frameIndex)
      );
      
      if (hasAnnotations) {
        frames.add(frameIndex);
      }
    }
    
    return frames;
  }, [annotations, persons, totalFrames]);
  
  const handleSliderChange = useCallback((value) => {
    onFrameChange?.(value);
  }, [onFrameChange]);
  
  const handlePrevFrame = useCallback(() => {
    onPrevFrame?.();
  }, [onPrevFrame]);
  
  const handleNextFrame = useCallback(() => {
    onNextFrame?.();
  }, [onNextFrame]);
  
  const goToFirstFrame = useCallback(() => {
    onFrameChange?.(0);
  }, [onFrameChange]);
  
  const goToLastFrame = useCallback(() => {
    onFrameChange?.(totalFrames - 1);
  }, [onFrameChange, totalFrames]);
  
  // Custom marks for annotated frames
  const marks = useMemo(() => {
    const frameMarks = {};
    
    // Add marks for annotated frames
    annotatedFrames.forEach(frameIndex => {
      frameMarks[frameIndex] = {
        style: {
          color: '#52c41a',
          fontWeight: 'bold',
        },
        label: '●',
      };
    });
    
    // Add marks for first and last frame
    frameMarks[0] = {
      style: {
        color: '#1890ff',
      },
      label: '1',
    };
    
    if (totalFrames > 1) {
      frameMarks[totalFrames - 1] = {
        style: {
          color: '#1890ff',
        },
        label: totalFrames.toString(),
      };
    }
    
    return frameMarks;
  }, [annotatedFrames, totalFrames]);
  
  if (totalFrames <= 0) {
    return null;
  }
  
  return (
    <div className="frame-slider">
      <div className="frame-controls">
        <Tooltip title="First Frame">
          <Button 
            icon={<StepBackwardOutlined />}
            onClick={goToFirstFrame}
            disabled={currentFrame === 0}
            size="small"
          />
        </Tooltip>
        
        <Tooltip title="Previous Frame (←)">
          <Button 
            icon={<LeftOutlined />}
            onClick={handlePrevFrame}
            disabled={currentFrame === 0}
            size="small"
          />
        </Tooltip>
        
        <span className="frame-info">
          Frame {currentFrame + 1} / {totalFrames}
        </span>
        
        <Tooltip title="Next Frame (→)">
          <Button 
            icon={<RightOutlined />}
            onClick={handleNextFrame}
            disabled={currentFrame >= totalFrames - 1}
            size="small"
          />
        </Tooltip>
        
        <Tooltip title="Last Frame">
          <Button 
            icon={<StepForwardOutlined />}
            onClick={goToLastFrame}
            disabled={currentFrame >= totalFrames - 1}
            size="small"
          />
        </Tooltip>
      </div>
      
      <div className="slider-container">
        <Slider
          min={0}
          max={totalFrames - 1}
          value={currentFrame}
          onChange={handleSliderChange}
          marks={marks}
          tooltip={{
            formatter: (value) => `Frame ${value + 1}`,
          }}
        />
      </div>
      
      <div className="annotation-legend">
        <span className="legend-item">
          <span className="legend-dot annotated"></span>
          Annotated
        </span>
        <span className="legend-item">
          <span className="legend-dot unannotated"></span>
          Unannotated
        </span>
      </div>
    </div>
  );
};

export default FrameSlider;
