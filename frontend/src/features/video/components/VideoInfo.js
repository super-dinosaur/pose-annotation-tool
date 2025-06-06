/**
 * Video information display component
 */

import React from 'react';
import { Card, Descriptions, Progress, Tag } from 'antd';
import { getAnnotationStats } from '../../../utils/annotation';

/**
 * VideoInfo component
 * @param {Object} props - Component props
 * @param {string} props.videoName - Video name
 * @param {import('../../../types').VideoInfo} props.videoInfo - Video information
 * @param {number} props.totalFrames - Total frames
 * @param {number} props.currentFrame - Current frame
 * @param {import('../../../types').Annotations} props.annotations - Annotations data
 * @param {import('../../../types').Person[]} props.persons - Persons data
 * @param {boolean} props.simplified - Whether to show simplified view
 * @returns {JSX.Element}
 */
export const VideoInfo = ({ 
  videoName, 
  videoInfo, 
  totalFrames, 
  currentFrame, 
  annotations, 
  persons = [],
  simplified = false 
}) => {
  const stats = getAnnotationStats(annotations, persons);
  
  if (simplified) {
    return (
      <div className="video-info-simplified">
        <Descriptions size="small" column={1}>
          <Descriptions.Item label="Video">{videoName || 'No video'}</Descriptions.Item>
          <Descriptions.Item label="Frame">{currentFrame + 1} / {totalFrames}</Descriptions.Item>
          <Descriptions.Item label="Persons">{persons.length}</Descriptions.Item>
          <Descriptions.Item label="Progress">
            <Progress 
              percent={Math.round(stats.completionRate)} 
              size="small" 
              showInfo={false}
            />
            {Math.round(stats.completionRate)}%
          </Descriptions.Item>
        </Descriptions>
      </div>
    );
  }
  
  return (
    <div className="video-info">
      <Card title="Video Information" size="small">
        <Descriptions size="small" column={1}>
          <Descriptions.Item label="Name">{videoName || 'No video loaded'}</Descriptions.Item>
          <Descriptions.Item label="Dimensions">
            {videoInfo.width} × {videoInfo.height}
          </Descriptions.Item>
          <Descriptions.Item label="Duration">
            {Math.round(videoInfo.duration * 100) / 100}s
          </Descriptions.Item>
          <Descriptions.Item label="Frame Rate">
            {videoInfo.frameRate} fps
          </Descriptions.Item>
          <Descriptions.Item label="Total Frames">
            {totalFrames}
          </Descriptions.Item>
          <Descriptions.Item label="Current Frame">
            {currentFrame + 1}
          </Descriptions.Item>
        </Descriptions>
      </Card>
      
      <Card title="Annotation Statistics" size="small" style={{ marginTop: 16 }}>
        <Descriptions size="small" column={1}>
          <Descriptions.Item label="Persons">
            <Tag color="blue">{stats.totalPersons}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Annotated Frames">
            <Tag color="green">{stats.annotatedFrames}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Total Keypoints">
            <Tag color="orange">{stats.totalKeypoints}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Completion">
            <Progress 
              percent={Math.round(stats.completionRate)} 
              size="small"
            />
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
};

export default VideoInfo;
