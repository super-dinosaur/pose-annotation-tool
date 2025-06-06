/**
 * Debug info component to help troubleshoot issues
 */

import React from 'react';
import { Card, Typography, Button } from 'antd';
import { useAppContext } from '../../store';

const { Text, Paragraph } = Typography;

/**
 * DebugInfo component
 * @returns {JSX.Element}
 */
export const DebugInfo = () => {
  const { state, actions } = useAppContext();
  const { video, annotation, ui } = state;
  
  const handleForceStopLoading = () => {
    actions.setVideoLoading(false);
    console.log('Manually stopped loading state');
  };
  
  const handleRetryVideoLoad = () => {
    console.log('Retrying video load...');
    actions.setVideoLoading(true);
    // This will trigger the useVideoFrame hook to reload
    actions.setVideoSrc(video.src, video.name);
  };
  
  const handleDebugVideo = () => {
    console.log('Debug - Current video element info:');
    const videoElement = document.querySelector('video');
    if (videoElement) {
      console.log({
        videoWidth: videoElement.videoWidth,
        videoHeight: videoElement.videoHeight,
        duration: videoElement.duration,
        readyState: videoElement.readyState,
        networkState: videoElement.networkState
      });
    } else {
      console.log('No video element found in DOM');
    }
  };
  
  return (
    <Card 
      title="Debug Information" 
      size="small" 
      style={{ 
        position: 'fixed', 
        bottom: 20, 
        right: 20, 
        width: 300, 
        zIndex: 1000,
        fontSize: 12
      }}
    >
      <Paragraph style={{ margin: 0, fontSize: 11 }}>
        <Text strong>Video State:</Text><br/>
        • Source: {video.src ? '✅ Set' : '❌ None'}<br/>
        • Name: {video.name || 'None'}<br/>
        • Loading: {video.isLoading ? '🔄 YES' : '✅ NO'}<br/>
        • Frame Image: {video.frameImage ? '✅ Available' : '❌ None'}<br/>
        • Dimensions: {video.info.width}x{video.info.height}<br/>
        • Total Frames: {video.totalFrames}<br/>
        • Current Frame: {video.currentFrame}<br/>
        <br/>
        <Text strong>UI State:</Text><br/>
        • Active Tab: {ui.activeTab}<br/>
        • Persons: {annotation.persons.length}<br/>
      </Paragraph>
      
      <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {video.isLoading && (
          <Button 
            size="small" 
            danger 
            onClick={handleForceStopLoading}
          >
            Force Stop Loading
          </Button>
        )}
        
        {video.src && (
          <Button 
            size="small" 
            onClick={handleRetryVideoLoad}
          >
            Retry Load
          </Button>
        )}
        
        <Button 
          size="small" 
          onClick={handleDebugVideo}
        >
          Debug Video
        </Button>
      </div>
    </Card>
  );
};

export default DebugInfo;
