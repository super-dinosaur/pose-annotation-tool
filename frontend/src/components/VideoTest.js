import React from 'react';
import { Button, Space, Card } from 'antd';
import { useAppContext } from '../store';

/**
 * Test component for debugging video functionality
 */
export const VideoTest = () => {
  const { state, actions } = useAppContext();
  const { video } = state;
  
  const testLocalVideo = () => {
    // Create a test file input
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const url = URL.createObjectURL(file);
        console.log('[VideoTest] Created blob URL:', url);
        actions.setVideoSrc(url, file.name);
      }
    };
    input.click();
  };
  
  const testRemoteVideo = () => {
    const testUrl = 'https://www.w3schools.com/html/mov_bbb.mp4';
    console.log('[VideoTest] Testing with remote video:', testUrl);
    actions.setVideoSrc(testUrl, 'big_buck_bunny.mp4');
  };
  
  const clearVideo = () => {
    console.log('[VideoTest] Clearing video');
    actions.setVideoSrc(null, '');
  };
  
  return (
    <Card title="Video Test Controls" style={{ margin: 16 }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Button onClick={testLocalVideo} type="primary" block>
          Test with Local File
        </Button>
        <Button onClick={testRemoteVideo} block>
          Test with Remote Video
        </Button>
        <Button onClick={clearVideo} danger block>
          Clear Video
        </Button>
        
        <div style={{ marginTop: 16, padding: 8, background: '#f0f0f0' }}>
          <strong>Current Status:</strong><br/>
          Source: {video.src ? 'Set' : 'None'}<br/>
          Loading: {video.isLoading ? 'Yes' : 'No'}<br/>
          Dimensions: {video.info.width}x{video.info.height}<br/>
          Frames: {video.totalFrames}
        </div>
      </Space>
    </Card>
  );
};

export default VideoTest;
