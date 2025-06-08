/**
 * Enhanced debug info component
 */

import React, { useEffect, useState } from 'react';
import { Card, Typography, Button, Tabs, Tag } from 'antd';
import { useAppContext } from '../../store';

const { Text, Paragraph } = Typography;
const { TabPane } = Tabs;

/**
 * DebugInfo component
 * @returns {JSX.Element}
 */
export const DebugInfo = () => {
  const { state, actions } = useAppContext();
  const { video, annotation, ui } = state;
  const [showDebug, setShowDebug] = useState(true);
  
  // Real-time state logging
  useEffect(() => {
    console.log('[DebugInfo] Complete state:', state);
  }, [state]);
  
  const handleForceStopLoading = () => {
    actions.setVideoLoading(false);
    console.log('Manually stopped loading state');
  };
  
  const handleRetryVideoLoad = () => {
    console.log('Retrying video load...');
    const currentSrc = video.src;
    const currentName = video.name;
    
    if (currentSrc) {
      // Clear and reload
      actions.setVideoSrc(null, '');
      setTimeout(() => {
        actions.setVideoSrc(currentSrc, currentName);
      }, 100);
    }
  };
  
  const handleDebugVideo = () => {
    const videoElements = document.querySelectorAll('video');
    console.log('Video elements in DOM:', videoElements.length);
    
    videoElements.forEach((video, index) => {
      console.log(`Video ${index}:`, {
        src: video.src,
        readyState: video.readyState,
        networkState: video.networkState,
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight,
        duration: video.duration,
        currentTime: video.currentTime,
        error: video.error
      });
    });
  };
  
  const handleTestVideo = () => {
    // Test with a known working video
    const testUrl = 'https://www.w3schools.com/html/mov_bbb.mp4';
    console.log('Testing with sample video:', testUrl);
    actions.setVideoSrc(testUrl, 'test_video.mp4');
  };
  
  if (!showDebug) {
    return (
      <Button 
        style={{ position: 'fixed', bottom: 20, right: 20 }}
        onClick={() => setShowDebug(true)}
      >
        Show Debug
      </Button>
    );
  }
  
  return (
    <Card 
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Debug Panel</span>
          <Button size="small" onClick={() => setShowDebug(false)}>Hide</Button>
        </div>
      }
      size="small" 
      style={{ 
        position: 'fixed', 
        bottom: 20, 
        right: 20, 
        width: 400, 
        maxHeight: '60vh',
        overflow: 'auto',
        zIndex: 1000,
        fontSize: 12
      }}
    >
      <Tabs defaultActiveKey="1" size="small">
        <TabPane tab="Video State" key="1">
          <Paragraph style={{ margin: 0, fontSize: 11 }}>
            <Text strong>Source:</Text> {video.src ? 
              <Tag color="green">Set ({video.src.substring(0, 50)}...)</Tag> : 
              <Tag color="red">None</Tag>
            }<br/>
            <Text strong>Name:</Text> {video.name || 'None'}<br/>
            <Text strong>Loading:</Text> {video.isLoading ? 
              <Tag color="orange">Loading...</Tag> : 
              <Tag color="green">Ready</Tag>
            }<br/>
            <Text strong>Frame Image:</Text> {video.frameImage ? 
              <Tag color="green">Available</Tag> : 
              <Tag color="red">None</Tag>
            }<br/>
            <Text strong>Dimensions:</Text> {video.info.width}x{video.info.height}<br/>
            <Text strong>Duration:</Text> {video.info.duration?.toFixed(2)}s<br/>
            <Text strong>Frame Rate:</Text> {video.info.frameRate}fps<br/>
            <Text strong>Total Frames:</Text> {video.totalFrames}<br/>
            <Text strong>Current Frame:</Text> {video.currentFrame}<br/>
          </Paragraph>
        </TabPane>
        
        <TabPane tab="Actions" key="2">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {video.isLoading && (
              <Button 
                size="small" 
                danger 
                onClick={handleForceStopLoading}
                block
              >
                Force Stop Loading
              </Button>
            )}
            
            {video.src && (
              <Button 
                size="small" 
                onClick={handleRetryVideoLoad}
                block
              >
                Retry Load
              </Button>
            )}
            
            <Button 
              size="small" 
              onClick={handleDebugVideo}
              block
            >
              Inspect Video Elements
            </Button>
            
            <Button 
              size="small" 
              onClick={handleTestVideo}
              type="dashed"
              block
            >
              Test with Sample Video
            </Button>
          </div>
        </TabPane>
        
        <TabPane tab="Console" key="3">
          <div style={{ fontSize: 10, fontFamily: 'monospace' }}>
            <div>// Debug commands:</div>
            <div style={{ color: '#666' }}>
              // Get current state<br/>
              window.__debugState = state;<br/>
              console.log(window.__debugState);<br/><br/>
              
              // Test video upload<br/>
              window.__testUpload = () => {'{'}
                const url = 'test.mp4';<br/>
                &nbsp;&nbsp;actions.setVideoSrc(url, 'test.mp4');<br/>
              {'}'};<br/><br/>
              
              // Check video elements<br/>
              document.querySelectorAll('video');
            </div>
          </div>
        </TabPane>
      </Tabs>
      
      {/* Real-time state display */}
      <div style={{ marginTop: 8, padding: 8, background: '#f5f5f5', borderRadius: 4 }}>
        <Text style={{ fontSize: 10, fontFamily: 'monospace' }}>
          State Updated: {new Date().toLocaleTimeString()}
        </Text>
      </div>
    </Card>
  );
};

export default DebugInfo;
