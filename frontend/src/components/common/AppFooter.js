/**
 * App footer with frame slider
 */

import React, { useCallback } from 'react';
import { FrameSlider } from '../../features/video/components/FrameSlider';
import { useAppContext } from '../../store';
import './AppFooter.css';

/**
 * AppFooter component
 * @returns {JSX.Element}
 */
export const AppFooter = () => {
  const { state, actions } = useAppContext();
  const { video, annotation } = state;
  
  const handleFrameChange = useCallback((frameIndex) => {
    actions.setCurrentFrame(frameIndex);
  }, [actions]);
  
  const handlePrevFrame = useCallback(() => {
    const newFrame = Math.max(0, video.currentFrame - 1);
    actions.setCurrentFrame(newFrame);
  }, [actions, video.currentFrame]);
  
  const handleNextFrame = useCallback(() => {
    const newFrame = Math.min(video.totalFrames - 1, video.currentFrame + 1);
    actions.setCurrentFrame(newFrame);
  }, [actions, video.currentFrame, video.totalFrames]);
  
  if (!video.src || video.totalFrames <= 0) {
    return null;
  }
  
  return (
    <div className="app-footer">
      <FrameSlider
        currentFrame={video.currentFrame}
        totalFrames={video.totalFrames}
        onFrameChange={handleFrameChange}
        onPrevFrame={handlePrevFrame}
        onNextFrame={handleNextFrame}
        annotations={annotation.annotations}
        persons={annotation.persons}
      />
    </div>
  );
};

export default AppFooter;
