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
    console.log("Video source changed:", videoSrc);

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
      return;
    }

    console.log("Loading video metadata...");
    actions.setVideoLoading(true);

    // Create a hidden container for the video element
    if (!hiddenVideoContainerRef.current) {
      hiddenVideoContainerRef.current = document.createElement("div");
      hiddenVideoContainerRef.current.style.position = "absolute";
      hiddenVideoContainerRef.current.style.left = "-9999px";
      hiddenVideoContainerRef.current.style.top = "-9999px";
      document.body.appendChild(hiddenVideoContainerRef.current);
    }

    const video = document.createElement("video");
    // Remove crossOrigin for blob URLs
    if (!videoSrc.startsWith("blob:")) {
      video.crossOrigin = "anonymous";
    }
    video.preload = "auto"; // Changed from 'metadata' to 'auto'
    video.muted = true; // Add muted to help with autoplay policies

    // Append video to hidden container
    hiddenVideoContainerRef.current.appendChild(video);

    // Add a safety timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.log("Video loading timeout, forcing loading state to false");
      actions.setVideoLoading(false);
    }, 15000); // Increased timeout

    // Function to process video metadata
    const processVideoMetadata = () => {
      const info = {
        width: video.videoWidth,
        height: video.videoHeight,
        duration: video.duration,
        frameRate: APP_CONSTANTS.DEFAULT_VIDEO_FRAME_RATE || 30,
      };

      console.log("Processing video info:", info);

      // Validate video info
      if (
        info.width === 0 ||
        info.height === 0 ||
        !isFinite(info.duration) ||
        info.duration === 0
      ) {
        console.error("Invalid video metadata:", info);
        return false;
      }

      const frames = calculateTotalFrames(info.duration, info.frameRate);
      console.log("Total frames calculated:", frames);

      actions.setVideoInfo(info, frames);
      actions.setCurrentFrame(0);

      // Extract first frame after a small delay to ensure video is ready
      setTimeout(() => {
        console.log("Extracting first frame...");
        extractFrameFromVideo(video, 0, info.frameRate)
          .then((frameImage) => {
            console.log("First frame extracted successfully");
            actions.setFrameImage(frameImage);
            actions.setVideoLoading(false);
          })
          .catch((error) => {
            console.error("Frame extraction failed:", error);
            // Try once more with a delay
            setTimeout(() => {
              extractFrameFromVideo(video, 0, info.frameRate)
                .then((frameImage) => {
                  console.log("First frame extracted on retry");
                  actions.setFrameImage(frameImage);
                  actions.setVideoLoading(false);
                })
                .catch((retryError) => {
                  console.error(
                    "Frame extraction failed on retry:",
                    retryError,
                  );
                  actions.setVideoLoading(false);
                });
            }, 500);
          });
      }, 100);

      return true;
    };

    // Use loadeddata event which is more reliable
    video.onloadeddata = () => {
      console.log("Video data loaded, checking if metadata is ready");
      if (video.readyState >= 2) {
        // HAVE_CURRENT_DATA
        clearTimeout(timeoutId);
        processVideoMetadata();
      }
    };

    video.onloadedmetadata = () => {
      console.log("Video metadata loaded");
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        clearTimeout(timeoutId);
        processVideoMetadata();
      }
    };

    video.oncanplaythrough = () => {
      console.log("Video can play through");
      // Another chance to process if not already done
      if (!video.videoWidth || !video.videoHeight) {
        return;
      }
      if (state.video.info.width === 0) {
        clearTimeout(timeoutId);
        processVideoMetadata();
      }
    };

    video.onerror = (error) => {
      clearTimeout(timeoutId);
      actions.setVideoLoading(false);
      console.error("Failed to load video:", error);
      console.error("Video error code:", video.error?.code);
      console.error("Video error message:", video.error?.message);
    };

    // Set source and trigger load
    video.src = videoSrc;
    video.load(); // Explicitly call load

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
