/**
 * Custom hook for video frame extraction and management
 */

import { useEffect, useCallback, useRef } from "react";
import {
  extractFrameFromVideo,
  calculateTotalFrames,
} from "../services/videoService";
import { APP_CONSTANTS } from "../../../constants";
import { useAppContext } from "../../../store";

/**
 * Hook for managing video frames
 * @returns {Object} Video frame management state and functions
 */
export const useVideoFrame = () => {
  const { state, actions } = useAppContext();
  const { video } = state;
  const videoSrc = video.src;

  console.log("=== useVideoFrame called ===");
  console.log("Current video source:", videoSrc);

  const videoRef = useRef(null);
  const hiddenVideoContainerRef = useRef(null);

  // Initialize video element
  useEffect(() => {
    console.log("=== useVideoFrame: Video source changed ===");
    console.log("New video source:", videoSrc);

    if (!videoSrc) {
      console.log("No video source, resetting video info");
      actions.setVideoInfo(
        {
          width: 0,
          height: 0,
          duration: 0,
          frameRate: APP_CONSTANTS.DEFAULT_VIDEO_FRAME_RATE,
        },
        0,
      );
      actions.setCurrentFrame(0);
      actions.setFrameImage(null);
      actions.setVideoLoading(false);
      return;
    }

    console.log("Starting video loading process...");
    actions.setVideoLoading(true);

    // Create a hidden container for the video element
    if (!hiddenVideoContainerRef.current) {
      hiddenVideoContainerRef.current = document.createElement("div");
      hiddenVideoContainerRef.current.style.position = "absolute";
      hiddenVideoContainerRef.current.style.left = "-9999px";
      hiddenVideoContainerRef.current.style.top = "-9999px";
      hiddenVideoContainerRef.current.style.visibility = "hidden";
      document.body.appendChild(hiddenVideoContainerRef.current);
      console.log("Created hidden video container");
    }

    const video = document.createElement("video");
    
    // Configure video element
    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;
    
    // Only set crossOrigin for non-blob URLs
    if (!videoSrc.startsWith("blob:")) {
      video.crossOrigin = "anonymous";
    }
    
    console.log("Video element created and configured");

    // Append video to hidden container
    hiddenVideoContainerRef.current.appendChild(video);
    console.log("Video element appended to container");

    // Add a safety timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.warn("Video loading timeout reached - stopping loading state");
      actions.setVideoLoading(false);
    }, 10000);

    // Function to process video metadata
    const processVideoMetadata = () => {
      console.log("Processing video metadata...");
      console.log("Video dimensions:", video.videoWidth, "x", video.videoHeight);
      console.log("Video duration:", video.duration);
      console.log("Video readyState:", video.readyState);
      
      const info = {
        width: video.videoWidth,
        height: video.videoHeight,
        duration: video.duration,
        frameRate: APP_CONSTANTS.DEFAULT_VIDEO_FRAME_RATE || 30,
      };

      // Validate video info
      if (
        info.width === 0 ||
        info.height === 0 ||
        !isFinite(info.duration) ||
        info.duration <= 0
      ) {
        console.error("Invalid video metadata:", info);
        actions.setVideoLoading(false);
        return false;
      }

      const frames = calculateTotalFrames(info.duration, info.frameRate);
      console.log("Total frames calculated:", frames);

      // Update video info in state
      actions.setVideoInfo(info, frames);
      actions.setCurrentFrame(0);

      // Extract first frame
      console.log("Extracting first frame...");
      extractFrameFromVideo(video, 0, info.frameRate)
        .then((frameImage) => {
          console.log("First frame extracted successfully");
          actions.setFrameImage(frameImage);
          actions.setVideoLoading(false);
        })
        .catch((error) => {
          console.error("Failed to extract first frame:", error);
          actions.setVideoLoading(false);
        });

      return true;
    };

    // Single event handler for metadata loading
    video.onloadedmetadata = () => {
      console.log("Video metadata loaded successfully");
      clearTimeout(timeoutId);
      
      // Small delay to ensure metadata is fully available
      setTimeout(() => {
        processVideoMetadata();
      }, 100);
    };

    video.onerror = (error) => {
      clearTimeout(timeoutId);
      actions.setVideoLoading(false);
      console.error("Video loading error:", error);
      console.error("Video error code:", video.error?.code);
      console.error("Video error message:", video.error?.message);
    };

    // Set source and start loading
    console.log("Setting video source:", videoSrc);
    video.src = videoSrc;
    console.log("Starting video load...");
    video.load();

    videoRef.current = video;

    return () => {
      clearTimeout(timeoutId);
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.removeAttribute("src");
        videoRef.current.load();
        if (
          hiddenVideoContainerRef.current &&
          videoRef.current.parentNode === hiddenVideoContainerRef.current
        ) {
          hiddenVideoContainerRef.current.removeChild(videoRef.current);
        }
        videoRef.current = null;
      }
      if (
        hiddenVideoContainerRef.current &&
        hiddenVideoContainerRef.current.parentNode
      ) {
        document.body.removeChild(hiddenVideoContainerRef.current);
        hiddenVideoContainerRef.current = null;
      }
    };
  }, [videoSrc, actions]);

  // Extract frame when current frame changes
  useEffect(() => {
    if (!videoRef.current || !videoSrc || video.totalFrames === 0) return;

    console.log("Extracting frame for index:", video.currentFrame);
    actions.setVideoLoading(true);

    extractFrameFromVideo(
      videoRef.current,
      video.currentFrame,
      video.info.frameRate,
    )
      .then((image) => {
        console.log("Frame extracted for index:", video.currentFrame);
        actions.setFrameImage(image);
        actions.setVideoLoading(false);
      })
      .catch((error) => {
        console.error("Failed to extract frame:", error);
        actions.setVideoLoading(false);
      });
  }, [
    video.currentFrame,
    videoSrc,
    video.info.frameRate,
    video.totalFrames,
    actions,
  ]);

  // Navigation functions
  const nextFrame = useCallback(() => {
    const newFrame = Math.min(video.currentFrame + 1, video.totalFrames - 1);
    actions.setCurrentFrame(newFrame);
  }, [video.currentFrame, video.totalFrames, actions]);

  const prevFrame = useCallback(() => {
    const newFrame = Math.max(video.currentFrame - 1, 0);
    actions.setCurrentFrame(newFrame);
  }, [video.currentFrame, actions]);

  const goToFrame = useCallback(
    (frameIndex) => {
      const clampedFrame = Math.max(
        0,
        Math.min(frameIndex, video.totalFrames - 1),
      );
      actions.setCurrentFrame(clampedFrame);
    },
    [video.totalFrames, actions],
  );

  return {
    videoInfo: video.info,
    currentFrame: video.currentFrame,
    totalFrames: video.totalFrames,
    frameImage: video.frameImage,
    isLoading: video.isLoading,
    nextFrame,
    prevFrame,
    goToFrame,
  };
};
