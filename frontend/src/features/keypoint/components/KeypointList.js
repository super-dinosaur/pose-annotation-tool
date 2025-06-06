/**
 * Keypoint list component
 */

import React, { useCallback, useMemo } from 'react';
import { List, Button, Badge, Typography, Empty } from 'antd';
import { AimOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { KEYPOINTS } from '../../../constants';
import { hasPersonAnnotations } from '../../../utils/annotation';
import './KeypointList.css';

const { Text } = Typography;

/**
 * KeypointList component
 * @param {Object} props - Component props
 * @param {import('../../../types').Keypoint|null} props.selectedKeypoint - Selected keypoint
 * @param {Function} props.onKeypointSelect - Callback when keypoint is selected
 * @param {import('../../../types').Annotations} props.annotations - Annotations data
 * @param {number} props.currentFrame - Current frame index
 * @param {string|null} props.selectedPersonId - Selected person ID
 * @returns {JSX.Element}
 */
export const KeypointList = ({
  selectedKeypoint,
  onKeypointSelect,
  annotations = {},
  currentFrame = 0,
  selectedPersonId = null,
}) => {
  // Get current frame annotations for selected person
  const currentFrameAnnotations = useMemo(() => {
    if (!selectedPersonId) return {};
    
    const frameKey = `frame_${currentFrame}`;
    const frameData = annotations[frameKey];
    
    return frameData?.[selectedPersonId] || {};
  }, [annotations, currentFrame, selectedPersonId]);
  
  const handleKeypointClick = useCallback((keypoint) => {
    onKeypointSelect?.(keypoint);
  }, [onKeypointSelect]);
  
  const renderKeypointItem = useCallback((keypoint) => {
    const isSelected = selectedKeypoint?.id === keypoint.id;
    const isAnnotated = currentFrameAnnotations[keypoint.id];
    const position = currentFrameAnnotations[keypoint.id];
    
    return (
      <List.Item
        key={keypoint.id}
        className={`keypoint-item ${isSelected ? 'selected' : ''}`}
        onClick={() => handleKeypointClick(keypoint)}
      >
        <List.Item.Meta
          avatar={
            <Badge 
              dot={isAnnotated} 
              offset={[-8, 8]}
              color={keypoint.color}
            >
              <Button
                type={isSelected ? 'primary' : 'default'}
                shape="circle"
                size="small"
                icon={isAnnotated ? <CheckCircleOutlined /> : <AimOutlined />}
                style={{ 
                  backgroundColor: isSelected ? keypoint.color : undefined,
                  borderColor: keypoint.color,
                  color: isSelected ? '#fff' : keypoint.color
                }}
              />
            </Badge>
          }
          title={
            <span 
              className="keypoint-name"
              style={{ 
                color: isSelected ? keypoint.color : undefined,
                fontWeight: isSelected ? 'bold' : 'normal'
              }}
            >
              {keypoint.name}
            </span>
          }
          description={
            <div className="keypoint-info">
              <Text type="secondary" className="keypoint-id">
                ID: {keypoint.id}
              </Text>
              {position && (
                <Text type="secondary" className="keypoint-position">
                  ({Math.round(position.x)}, {Math.round(position.y)})
                </Text>
              )}
            </div>
          }
        />
      </List.Item>
    );
  }, [selectedKeypoint, currentFrameAnnotations, handleKeypointClick]);
  
  if (!selectedPersonId) {
    return (
      <div className="keypoint-list">
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Select a person to annotate keypoints"
          className="keypoint-empty"
        />
      </div>
    );
  }
  
  const annotatedCount = Object.keys(currentFrameAnnotations).length;
  const totalCount = KEYPOINTS.length;
  const completionPercentage = Math.round((annotatedCount / totalCount) * 100);
  
  return (
    <div className="keypoint-list">
      <div className="keypoint-header">
        <div className="keypoint-progress">
          <Text strong>
            Progress: {annotatedCount}/{totalCount} ({completionPercentage}%)
          </Text>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </div>
      
      <List
        dataSource={KEYPOINTS}
        renderItem={renderKeypointItem}
        size="small"
        className="keypoints"
      />
      
      <div className="keypoint-hint">
        <Text type="secondary" className="hint-text">
          Click on the canvas to place selected keypoint
        </Text>
      </div>
    </div>
  );
};

export default KeypointList;
