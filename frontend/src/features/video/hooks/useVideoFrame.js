/**
 * Custom hook for video frame extraction and management
 */

import { useEffect, useCallback, useRef, useState } from "react";
import {
  extractFrameFromVideo,
  calculateTotalFrames,
} from "../services/videoService";
import { detectBlackBorders } from "../../../utils/videoCrop";
import { APP_CONSTANTS } from "../../../constants";
import { useAppContext } from "../../../store";

// 全局变量，确保只有一个实例在处理视频
let globalVideoProcessor = null;

/**
 * Hook for managing video frames
 * @returns {Object} Video frame management state and functions
 */
export const useVideoFrame = () => {
  const { state, actions } = useAppContext();
  const videoState = state.video;
  
  const videoRef = useRef(null);
  const hiddenVideoContainerRef = useRef(null);
  const instanceId = useRef(Math.random()); // 用于调试的实例ID

  console.log(`[useVideoFrame-${instanceId.current.toFixed(3)}] Hook called`);

  // Initialize video element when source changes
  useEffect(() => {
    const currentSrc = videoState?.src;
    
    console.log(`[useVideoFrame-${instanceId.current.toFixed(3)}] Effect triggered`, {
      currentSrc,
      hasGlobalProcessor: !!globalVideoProcessor
    });
    
    // Cleanup function
    const cleanup = () => {
      console.log(`[useVideoFrame-${instanceId.current.toFixed(3)}] Cleaning up`);
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.removeAttribute("src");
        videoRef.current.load();
        videoRef.current = null;
      }
      if (hiddenVideoContainerRef.current?.parentNode) {
        document.body.removeChild(hiddenVideoContainerRef.current);
        hiddenVideoContainerRef.current = null;
      }
      // 清除全局处理器
      if (globalVideoProcessor === instanceId.current) {
        globalVideoProcessor = null;
      }
    };
    
    if (!currentSrc) {
      console.log(`[useVideoFrame-${instanceId.current.toFixed(3)}] No source, cleaning up`);
      cleanup();
      return;
    }

    // 检查是否已经有其他实例在处理
    if (globalVideoProcessor && globalVideoProcessor !== instanceId.current) {
      console.log(`[useVideoFrame-${instanceId.current.toFixed(3)}] Another instance is processing, skipping`);
      return;
    }

    // 标记当前实例为处理器
    globalVideoProcessor = instanceId.current;
    console.log(`[useVideoFrame-${instanceId.current.toFixed(3)}] Starting video processing`);
    
    actions.setVideoLoading(true);

    // Create container if needed - 检查是否已存在
    let container = document.getElementById('video-hidden-container');
    if (!container) {
      container = document.createElement("div");
      container.id = 'video-hidden-container';
      container.style.display = "none";
      document.body.appendChild(container);
      console.log(`[useVideoFrame-${instanceId.current.toFixed(3)}] Created container`);
    }
    hiddenVideoContainerRef.current = container;

    // Create video element
    const videoElement = document.createElement("video");
    videoElement.preload = "metadata";
    videoElement.muted = true;
    videoElement.playsInline = true;
    
    if (!currentSrc.startsWith("blob:")) {
      videoElement.crossOrigin = "anonymous";
    }

    // Add to container
    container.appendChild(videoElement);
    videoRef.current = videoElement;

    // Set up event handlers
    const handleLoadedMetadata = async () => {
      console.log(`[useVideoFrame-${instanceId.current.toFixed(3)}] Metadata loaded`, {
        width: videoElement.videoWidth,
        height: videoElement.videoHeight,
        duration: videoElement.duration
      });
      
      const info = {
        width: videoElement.videoWidth,
        height: videoElement.videoHeight,
        duration: videoElement.duration,
        frameRate: APP_CONSTANTS.DEFAULT_VIDEO_FRAME_RATE || 30,
      };

      // Validate
      if (!info.width || !info.height || !info.duration) {
        console.error(`[useVideoFrame-${instanceId.current.toFixed(3)}] Invalid metadata`);
        actions.setVideoLoading(false);
        return;
      }

      const totalFrames = calculateTotalFrames(info.duration, info.frameRate);
      
      // Update state
      actions.setVideoInfo(info, totalFrames);
      actions.setCurrentFrame(0);

      // Extract first frame
      try {
        // Always use auto-crop to detect black borders
        const frameImage = await extractFrameFromVideo(videoElement, 0, info.frameRate, 'auto');
        console.log(`[useVideoFrame-${instanceId.current.toFixed(3)}] First frame extracted`);
        actions.setFrameImage(frameImage);
        
        // Detect black borders for the video
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = videoElement.videoWidth;
        tempCanvas.height = videoElement.videoHeight;
        tempCtx.drawImage(videoElement, 0, 0);
        
        const detected = detectBlackBorders(tempCanvas);
        const widthReduction = (tempCanvas.width - detected.width) / tempCanvas.width;
        const heightReduction = (tempCanvas.height - detected.height) / tempCanvas.height;
        
        if (widthReduction > 0.05 || heightReduction > 0.05) {
          console.log(`[useVideoFrame-${instanceId.current.toFixed(3)}] Black borders detected:`, detected);
          // Update video info with cropped dimensions
          const croppedInfo = {
            ...info,
            width: detected.width,
            height: detected.height,
            originalWidth: info.width,
            originalHeight: info.height
          };
          actions.setVideoInfo(croppedInfo, totalFrames);
          actions.setCropBounds(detected);
        } else {
          console.log(`[useVideoFrame-${instanceId.current.toFixed(3)}] No significant black borders detected`);
          actions.setCropBounds(null);
        }
      } catch (error) {
        console.error(`[useVideoFrame-${instanceId.current.toFixed(3)}] Frame extraction failed:`, error);
      }
      
      actions.setVideoLoading(false);
    };

    const handleError = (e) => {
      console.error(`[useVideoFrame-${instanceId.current.toFixed(3)}] Video error:`, e);
      actions.setVideoLoading(false);
    };

    // Attach event listeners
    videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    videoElement.addEventListener('error', handleError);
    
    // Load video
    console.log(`[useVideoFrame-${instanceId.current.toFixed(3)}] Loading video:`, currentSrc);
    videoElement.src = currentSrc;
    videoElement.load();

    // Cleanup on unmount
    return () => {
      console.log(`[useVideoFrame-${instanceId.current.toFixed(3)}] Effect cleanup`);
      videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      videoElement.removeEventListener('error', handleError);
      cleanup();
    };
  }, [videoState?.src]); // Only depend on src change

  // Extract frame when current frame changes
  useEffect(() => {
    const currentFrame = videoState?.currentFrame;
    const totalFrames = videoState?.totalFrames;
    const frameRate = videoState?.info?.frameRate;
    const src = videoState?.src;
    
    if (!videoRef.current || !src || !totalFrames) {
      return;
    }

    extractFrameFromVideo(videoRef.current, currentFrame, frameRate, videoState?.cropBounds)
      .then((image) => {
        actions.setFrameImage(image);
      })
      .catch((error) => {
        console.error("Frame extraction failed:", error);
      });
  }, [
    videoState?.currentFrame, 
    videoState?.totalFrames,
    videoState?.info?.frameRate,
    videoState?.cropBounds
  ]);

  // Navigation functions
  const nextFrame = useCallback(() => {
    const current = videoState?.currentFrame || 0;
    const total = videoState?.totalFrames || 0;
    
    if (total > 0 && current < total - 1) {
      actions.setCurrentFrame(current + 1);
    }
  }, [videoState, actions]);

  const prevFrame = useCallback(() => {
    const current = videoState?.currentFrame || 0;
    
    if (current > 0) {
      actions.setCurrentFrame(current - 1);
    }
  }, [videoState, actions]);

  const goToFrame = useCallback((frameIndex) => {
    const total = videoState?.totalFrames || 0;
    
    if (total > 0) {
      const clamped = Math.max(0, Math.min(frameIndex, total - 1));
      actions.setCurrentFrame(clamped);
    }
  }, [videoState, actions]);

  return {
    videoInfo: videoState?.info || { width: 0, height: 0, duration: 0, frameRate: 30 },
    currentFrame: videoState?.currentFrame || 0,
    totalFrames: videoState?.totalFrames || 0,
    frameImage: videoState?.frameImage || null,
    isLoading: videoState?.isLoading || false,
    nextFrame,
    prevFrame,
    goToFrame,
  };
};
