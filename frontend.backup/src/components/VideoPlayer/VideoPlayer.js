import React, { useEffect, useState, useRef } from 'react';
import { Image } from 'react-konva';
import { calculateScaleFactor } from '../../utils/videoUtils';
import './VideoPlayer.css';

/**
 * 视频播放器组件
 * @param {Object} props - 组件属性
 * @param {string} props.frameImage - 当前帧图像的 Data URL
 * @param {number} props.videoWidth - 视频宽度
 * @param {number} props.videoHeight - 视频高度
 * @param {boolean} props.isLoading - 是否正在加载
 * @returns {JSX.Element} - 返回视频播放器组件
 */
const VideoPlayer = ({ frameImage, videoWidth, videoHeight, isLoading }) => {
  const [image, setImage] = useState(null);
  const [scale, setScale] = useState(1);
  const containerRef = useRef(null);

  // 当帧图像变化时，加载新图像
  useEffect(() => {
    if (frameImage) {
      const img = new window.Image();
      img.src = frameImage;
      img.onload = () => {
        setImage(img);
      };
    } else {
      setImage(null);
    }
  }, [frameImage]);

  // 计算缩放比例
  useEffect(() => {
    if (!containerRef.current || !videoWidth || !videoHeight) return;

    const updateScale = () => {
      const container = containerRef.current;
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      
      const newScale = calculateScaleFactor(
        videoWidth, 
        videoHeight, 
        containerWidth, 
        containerHeight
      );
      
      setScale(newScale);
    };

    // 初始计算
    updateScale();
    
    // 窗口大小变化时重新计算
    window.addEventListener('resize', updateScale);
    
    return () => {
      window.removeEventListener('resize', updateScale);
    };
  }, [videoWidth, videoHeight]);

  return (
    <div className="video-player-container" ref={containerRef}>
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}
      
      {!frameImage && !isLoading && (
        <div className="upload-placeholder">
          请上传视频文件开始标注
        </div>
      )}
      
      {image && (
        <div 
          className="video-display"
          style={{
            width: videoWidth * scale,
            height: videoHeight * scale
          }}
        >
          <Image
            image={image}
            width={videoWidth * scale}
            height={videoHeight * scale}
          />
        </div>
      )}
    </div>
  );
};

export default VideoPlayer; 