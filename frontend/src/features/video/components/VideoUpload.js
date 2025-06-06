/**
 * Video upload component
 */

import React, { useCallback } from 'react';
import { Upload, Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { validateVideoFile, createVideoUrl } from '../services/videoService';

/**
 * VideoUpload component
 * @param {Object} props - Component props
 * @param {Function} props.onVideoUpload - Callback when video is uploaded
 * @param {boolean} props.disabled - Whether upload is disabled
 * @returns {JSX.Element}
 */
export const VideoUpload = ({ onVideoUpload, disabled = false }) => {
  const handleUpload = useCallback((info) => {
    console.log('=== UPLOAD HANDLER CALLED ===');
    console.log('Upload info:', info);
    
    const { file } = info;
    console.log('File status:', file.status);
    
    if (file.status === 'done') {
      console.log('File upload completed, creating video URL');
      const videoUrl = createVideoUrl(file.originFileObj);
      console.log('Video URL created:', videoUrl);
      
      console.log('Calling onVideoUpload callback');
      onVideoUpload?.(videoUrl, file.name);
      message.success(`${file.name} uploaded successfully`);
    } else if (file.status === 'error') {
      console.error('Upload failed for file:', file.name);
      message.error(`${file.name} upload failed`);
    }
  }, [onVideoUpload]);
  
  const beforeUpload = useCallback((file) => {
    console.log('=== BEFORE UPLOAD CHECK ===');
    console.log('File:', file);
    console.log('File type:', file.type);
    console.log('File size:', file.size);
    
    const isValidVideo = validateVideoFile(file);
    console.log('Is valid video:', isValidVideo);
    
    if (!isValidVideo) {
      message.error('Please upload a valid video file!');
    }
    return isValidVideo;
  }, []);
  
  const customRequest = useCallback(({ file, onSuccess }) => {
    console.log('=== CUSTOM REQUEST CALLED ===');
    console.log('Processing file:', file.name);
    // Simulate upload success
    setTimeout(() => {
      console.log('Custom request completing for:', file.name);
      onSuccess("ok");
    }, 0);
  }, []);
  
  return (
    <Upload
      name="video"
      showUploadList={false}
      beforeUpload={beforeUpload}
      customRequest={customRequest}
      onChange={handleUpload}
      disabled={disabled}
    >
      <Button 
        icon={<UploadOutlined />} 
        type="primary"
        disabled={disabled}
      >
        Upload Video
      </Button>
    </Upload>
  );
};

export default VideoUpload;
