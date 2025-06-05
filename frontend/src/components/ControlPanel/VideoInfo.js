import React from 'react';
import './VideoInfo.css';

/**
 * 视频信息组件
 * @param {Object} props - 组件属性
 * @param {string} props.videoName - 视频文件名
 * @param {Object} props.videoInfo - 视频信息
 * @param {number} props.totalFrames - 总帧数
 * @param {number} props.currentFrame - 当前帧索引
 * @param {Object} props.annotations - 标注数据
 * @param {Function} props.goToFrame - 跳转到指定帧的回调
 * @param {boolean} props.simplified - 是否为简化版本（只显示标注状态）
 * @returns {JSX.Element} - 返回视频信息组件
 */
const VideoInfo = ({ 
  videoName, 
  videoInfo, 
  totalFrames, 
  currentFrame, 
  annotations,
  goToFrame,
  simplified = false
}) => {
  // 获取已标注的帧数
  const getAnnotatedFramesCount = () => {
    return Object.keys(annotations).length;
  };

  // 获取当前帧的标注完成率
  const getCurrentFrameCompletionRate = () => {
    const frameKey = `frame_${currentFrame}`;
    const frameAnnotations = annotations[frameKey] || {};
    const annotatedCount = Object.keys(frameAnnotations).length;
    return Math.round((annotatedCount / 17) * 100); // 17个关键点
  };
  
  // 渲染标注状态网格
  const renderFrameStatusGrid = () => {
    return (
      <div className="frame-status-section">
        <h4>标注状态</h4>
        <div className="frame-status-list">
          {Array.from({ length: Math.min(totalFrames, 100) }).map((_, index) => {
            const frameKey = `frame_${index}`;
            const isAnnotated = !!annotations[frameKey];
            return (
              <div 
                key={index}
                className={`frame-status-item ${isAnnotated ? 'annotated' : ''} ${index === currentFrame ? 'current' : ''}`}
                onClick={() => goToFrame(index)}
                title={`帧 ${index + 1}${isAnnotated ? ' (已标注)' : ''}`}
              />
            );
          })}
        </div>
      </div>
    );
  };

  // 简化版本只显示标注状态
  if (simplified) {
    return (
      <div className="video-info-container simplified">
        {videoName ? renderFrameStatusGrid() : (
          <div className="no-video">请上传视频文件</div>
        )}
      </div>
    );
  }

  // 完整版本显示所有视频详情
  return (
    <div className="video-info-container">
      <h3>视频详情</h3>
      
      {videoName ? (
        <div className="video-details">
          <div className="info-item">
            <span className="info-label">文件名:</span>
            <span className="info-value">{videoName}</span>
          </div>
          
          <div className="info-item">
            <span className="info-label">分辨率:</span>
            <span className="info-value">{videoInfo.width} x {videoInfo.height}</span>
          </div>
          
          <div className="info-item">
            <span className="info-label">时长:</span>
            <span className="info-value">{videoInfo.duration ? videoInfo.duration.toFixed(2) : 0} 秒</span>
          </div>
          
          <div className="info-item">
            <span className="info-label">总帧数:</span>
            <span className="info-value">{totalFrames}</span>
          </div>
          
          <div className="info-item">
            <span className="info-label">已标注帧数:</span>
            <span className="info-value">{getAnnotatedFramesCount()}</span>
          </div>
          
          {annotations[`frame_${currentFrame}`] && (
            <div className="info-item">
              <span className="info-label">当前帧完成率:</span>
              <span className="info-value">{getCurrentFrameCompletionRate()}%</span>
            </div>
          )}
          
          {renderFrameStatusGrid()}
        </div>
      ) : (
        <div className="no-video">请上传视频文件</div>
      )}
    </div>
  );
};

export default VideoInfo; 