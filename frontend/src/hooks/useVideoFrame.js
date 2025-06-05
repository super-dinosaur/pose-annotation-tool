import { useState, useEffect, useCallback } from 'react';
import { extractFrameFromVideo, calculateTotalFrames } from '../utils/videoUtils';

/**
 * 视频帧处理的自定义钩子
 * @param {string} videoSrc - 视频源URL
 * @param {number} defaultFrameRate - 默认帧率
 * @returns {Object} - 返回视频帧相关的状态和方法
 */
const useVideoFrame = (videoSrc, defaultFrameRate = 30) => {
  const [videoElement, setVideoElement] = useState(null);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [totalFrames, setTotalFrames] = useState(0);
  const [frameRate, setFrameRate] = useState(defaultFrameRate);
  const [frameImage, setFrameImage] = useState(null);
  const [videoInfo, setVideoInfo] = useState({
    width: 0,
    height: 0,
    duration: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // 初始化视频元素
  useEffect(() => {
    if (!videoSrc) return;

    const video = document.createElement('video');
    video.src = videoSrc;
    video.preload = 'metadata';
    setVideoElement(video);
    setCurrentFrame(0);
    setFrameImage(null);
    setError(null);

    // 视频元数据加载完成后的处理
    video.onloadedmetadata = () => {
      setVideoInfo({
        width: video.videoWidth,
        height: video.videoHeight,
        duration: video.duration,
      });
      setTotalFrames(calculateTotalFrames(video.duration, frameRate));
    };

    video.onerror = () => {
      setError('视频加载失败');
    };

    return () => {
      video.src = '';
    };
  }, [videoSrc, frameRate]);

  // 加载指定帧
  const loadFrame = useCallback(async (frameIndex) => {
    if (!videoElement || frameIndex < 0 || frameIndex >= totalFrames) {
      return;
    }

    setIsLoading(true);
    try {
      const dataUrl = await extractFrameFromVideo(videoElement, frameIndex, frameRate);
      setFrameImage(dataUrl);
      setCurrentFrame(frameIndex);
    } catch (err) {
      setError(`加载帧 ${frameIndex} 失败: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [videoElement, totalFrames, frameRate]);

  // 当前帧改变时加载新帧
  useEffect(() => {
    if (videoElement && totalFrames > 0) {
      loadFrame(currentFrame);
    }
  }, [videoElement, totalFrames, loadFrame, currentFrame]);

  // 切换到下一帧
  const nextFrame = useCallback(() => {
    if (currentFrame < totalFrames - 1) {
      loadFrame(currentFrame + 1);
    }
  }, [currentFrame, totalFrames, loadFrame]);

  // 切换到上一帧
  const prevFrame = useCallback(() => {
    if (currentFrame > 0) {
      loadFrame(currentFrame - 1);
    }
  }, [currentFrame, loadFrame]);

  // 跳转到指定帧
  const goToFrame = useCallback((frameIndex) => {
    if (frameIndex >= 0 && frameIndex < totalFrames) {
      loadFrame(frameIndex);
    }
  }, [totalFrames, loadFrame]);

  return {
    videoInfo,
    currentFrame,
    totalFrames,
    frameRate,
    frameImage,
    isLoading,
    error,
    nextFrame,
    prevFrame,
    goToFrame,
    setFrameRate,
  };
};

export default useVideoFrame; 