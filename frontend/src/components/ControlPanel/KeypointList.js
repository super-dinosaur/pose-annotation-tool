import React from 'react';
import { List, Badge, Tooltip } from 'antd';
import { InfoCircleOutlined, SwapOutlined } from '@ant-design/icons';
import { KEYPOINTS } from '../../constants/keypoints';
import './KeypointList.css';

/**
 * 关键点列表组件
 * @param {Object} props - 组件属性
 * @param {Object} props.selectedKeypoint - 当前选中的关键点
 * @param {Function} props.onKeypointSelect - 关键点选择回调
 * @param {Object} props.annotations - 标注数据
 * @param {number} props.currentFrame - 当前帧索引
 * @param {string} props.selectedPerson - 当前选中的人物ID
 * @returns {JSX.Element} - 返回关键点列表组件
 */
const KeypointList = ({ 
  selectedKeypoint, 
  onKeypointSelect, 
  annotations, 
  currentFrame,
  selectedPerson
}) => {
  // 检查当前关键点是否已标注
  const isKeypointAnnotated = (keypointId) => {
    if (!selectedPerson) return false;
    
    const frameKey = `frame_${currentFrame}`;
    const frameAnnotations = annotations[frameKey] || {};
    const personAnnotations = frameAnnotations[selectedPerson] || {};
    return !!personAnnotations[keypointId];
  };

  return (
    <div className="keypoint-list-container">
      <div className="keypoint-list-header">
        <h3>人体关键点</h3>
        <Tooltip title="点击关键点，然后在视频画面上点击位置进行标注">
          <InfoCircleOutlined />
        </Tooltip>
      </div>
      
      {!selectedPerson && (
        <div className="no-person-selected">
          请先选择或创建一个人物
        </div>
      )}
      
      <List
        size="small"
        className="keypoint-list"
        dataSource={KEYPOINTS}
        renderItem={item => (
          <List.Item 
            className={`keypoint-item ${selectedKeypoint && selectedKeypoint.id === item.id ? 'selected-keypoint' : ''}`}
            onClick={() => selectedPerson && onKeypointSelect(item)}
            style={{ opacity: selectedPerson ? 1 : 0.5, cursor: selectedPerson ? 'pointer' : 'not-allowed' }}
          >
            <div className="keypoint-color" style={{ backgroundColor: item.color }}></div>
            <span className="keypoint-name">{item.name}</span>
            {isKeypointAnnotated(item.id) && <Badge status="success" />}
          </List.Item>
        )}
      />
      
      <div className="keypoint-scroll-hint">
        <SwapOutlined rotate={90} /> 使用鼠标滚轮切换关键点
      </div>
    </div>
  );
};

export default KeypointList; 