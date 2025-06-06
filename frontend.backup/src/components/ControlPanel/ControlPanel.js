import React from 'react';
import { Button, Slider, List, Card, Upload, message, Tooltip, Badge } from 'antd';
import { 
  UploadOutlined, 
  SaveOutlined, 
  LeftOutlined, 
  RightOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { KEYPOINTS } from '../../constants/keypoints';
import './ControlPanel.css';

/**
 * 控制面板组件
 * @param {Object} props - 组件属性
 * @param {Function} props.onVideoUpload - 视频上传回调
 * @param {Function} props.onSaveAnnotations - 保存标注回调
 * @param {Function} props.onPrevFrame - 上一帧回调
 * @param {Function} props.onNextFrame - 下一帧回调
 * @param {Function} props.onFrameChange - 帧变化回调
 * @param {Function} props.onKeypointSelect - 关键点选择回调
 * @param {number} props.currentFrame - 当前帧索引
 * @param {number} props.totalFrames - 总帧数
 * @param {Object} props.selectedKeypoint - 当前选中的关键点
 * @param {Object} props.annotations - 标注数据
 * @param {string} props.videoSrc - 视频源URL
 * @returns {JSX.Element} - 返回控制面板组件
 */
const ControlPanel = ({
  onVideoUpload,
  onSaveAnnotations,
  onPrevFrame,
  onNextFrame,
  onFrameChange,
  onKeypointSelect,
  currentFrame,
  totalFrames,
  selectedKeypoint,
  annotations,
  videoSrc
}) => {
  // 处理视频上传
  const handleVideoUpload = (info) => {
    if (info.file.status === 'done') {
      const videoUrl = URL.createObjectURL(info.file.originFileObj);
      onVideoUpload(videoUrl, info.file.name);
      message.success(`${info.file.name} 上传成功`);
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} 上传失败`);
    }
  };

  // 获取已标注的帧数
  const getAnnotatedFramesCount = () => {
    return Object.keys(annotations).length;
  };

  // 检查当前帧是否已标注
  const isCurrentFrameAnnotated = () => {
    const frameKey = `frame_${currentFrame}`;
    return !!annotations[frameKey];
  };

  // 获取当前帧的标注完成率
  const getCurrentFrameCompletionRate = () => {
    const frameKey = `frame_${currentFrame}`;
    const frameAnnotations = annotations[frameKey] || {};
    const annotatedCount = Object.keys(frameAnnotations).length;
    return Math.round((annotatedCount / KEYPOINTS.length) * 100);
  };

  return (
    <div className="control-panel">
      <div className="toolbar">
        <Upload
          name="video"
          showUploadList={false}
          beforeUpload={(file) => {
            const isVideo = file.type.startsWith('video/');
            if (!isVideo) {
              message.error('请上传视频文件!');
            }
            return isVideo;
          }}
          customRequest={({ file, onSuccess }) => {
            setTimeout(() => {
              onSuccess("ok");
            }, 0);
          }}
          onChange={handleVideoUpload}
        >
          <Button icon={<UploadOutlined />}>上传视频</Button>
        </Upload>
        
        <Button 
          icon={<SaveOutlined />} 
          onClick={onSaveAnnotations}
          disabled={!videoSrc || getAnnotatedFramesCount() === 0}
        >
          保存标注
        </Button>
      </div>
      
      {videoSrc && (
        <div className="video-info">
          <Card title="视频信息" size="small">
            <p>
              <strong>当前帧:</strong> {currentFrame + 1} / {totalFrames}
              {isCurrentFrameAnnotated() && (
                <Badge 
                  count={`${getCurrentFrameCompletionRate()}%`} 
                  style={{ backgroundColor: '#52c41a', marginLeft: '8px' }} 
                />
              )}
            </p>
            <p><strong>已标注帧数:</strong> {getAnnotatedFramesCount()}</p>
            
            <div className="frame-controls">
              <Button 
                icon={<LeftOutlined />} 
                onClick={onPrevFrame} 
                disabled={currentFrame === 0} 
              />
              <Slider
                min={0}
                max={totalFrames - 1}
                value={currentFrame}
                onChange={onFrameChange}
                style={{ flex: 1, margin: '0 10px' }}
                tooltip={{
                  formatter: (value) => `帧 ${value + 1}`
                }}
              />
              <Button 
                icon={<RightOutlined />} 
                onClick={onNextFrame} 
                disabled={currentFrame === totalFrames - 1} 
              />
            </div>
          </Card>
          
          <Card 
            title="关键点列表" 
            size="small" 
            className="keypoints-card"
            extra={
              <Tooltip title="点击左侧关键点，然后在视频画面上点击位置进行标注">
                <InfoCircleOutlined />
              </Tooltip>
            }
          >
            <List
              size="small"
              dataSource={KEYPOINTS}
              renderItem={item => {
                // 检查当前关键点是否已标注
                const frameKey = `frame_${currentFrame}`;
                const frameAnnotations = annotations[frameKey] || {};
                const isAnnotated = !!frameAnnotations[item.id];
                
                return (
                  <List.Item 
                    className={`keypoint-item ${selectedKeypoint && selectedKeypoint.id === item.id ? 'selected-keypoint' : ''}`}
                    onClick={() => onKeypointSelect(item)}
                  >
                    <div className="keypoint-color" style={{ backgroundColor: item.color }}></div>
                    <span>{item.name}</span>
                    {isAnnotated && <Badge status="success" />}
                  </List.Item>
                );
              }}
            />
          </Card>
        </div>
      )}
    </div>
  );
};

export default ControlPanel; 