/**
 * Custom hook for video frame extraction and management
 */

import { useEffect, useCallback, useRef, useState } from "react";
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
  const [retryCount, setRetryCount] = useState(0);

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
      setRetryCount(0);
      return;
    }

    console.log("Loading video metadata...");
    actions.setVideoLoading(true);

    // Create video element
    const video = document.createElement("video");

    // For blob URLs, we don't need CORS
    if (!videoSrc.startsWith("blob:")) {
      video.crossOrigin = "anonymous";
    }

    // Set video attributes for better compatibility
    video.autoplay = false;
    video.controls = false;
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";

    // Add video to body temporarily (hidden)
    video.style.position = "fixed";
    video.style.top = "-9999px";
    video.style.left = "-9999px";
    video.style.width = "1px";
    video.style.height = "1px";
    document.body.appendChild(video);

    let metadataLoaded = false;

    // Function to process video metadata
    const processVideoMetadata = () => {
      if (metadataLoaded) return;

      const info = {
        width: video.videoWidth,
        height: video.videoHeight,
        duration: video.duration,
        frameRate: APP_CONSTANTS.DEFAULT_VIDEO_FRAME_RATE || 30,
      };

      console.log("Processing video info:", info);
      console.log("Video readyState:", video.readyState);
      console.log("Video networkState:", video.networkState);

      // Validate video info
      if (
        info.width === 0 ||
        info.height === 0 ||
        !isFinite(info.duration) ||
        info.duration === 0
      ) {
        console.error("Invalid video metadata:", info);

        // Retry logic
        if (retryCount < 3) {
          console.log(
            `Retrying metadata load (attempt ${retryCount + 1}/3)...`,
          );
          setRetryCount(retryCount + 1);
          setTimeout(() => {
            video.load();
          }, 1000);
          return;
        } else {
          console.error("Failed to load video metadata after 3 attempts");
          actions.setVideoLoading(false);
          return;
        }
      }

      metadataLoaded = true;
      const frames = calculateTotalFrames(info.duration, info.frameRate);
      console.log("Total frames calculated:", frames);

      actions.setVideoInfo(info, frames);
      actions.setCurrentFrame(0);

      // Extract first frame
      console.log("Attempting to extract first frame...");

      // Ensure video is seekable
      video.currentTime = 0;

      const extractFirstFrame = () => {
        extractFrameFromVideo(video, 0, info.frameRate)
          .then((frameImage) => {
            console.log("First frame extracted successfully");
            console.log(
              "Frame image data URL length:",
              frameImage?.length || 0,
            );
            actions.setFrameImage(frameImage);
            actions.setVideoLoading(false);
            setRetryCount(0);
          })
          .catch((error) => {
            console.error("Frame extraction failed:", error);
            actions.setVideoLoading(false);
          });
      };

      // Wait a bit for video to be fully ready
      if (video.readyState >= 2) {
        extractFirstFrame();
      } else {
        video.addEventListener("canplay", extractFirstFrame, { once: true });
      }
    };

    // Multiple event handlers for better compatibility
    const handleLoadedMetadata = () => {
      console.log("loadedmetadata event fired");
      console.log(
        "Video dimensions:",
        video.videoWidth,
        "x",
        video.videoHeight,
      );
      console.log("Video duration:", video.duration);

      if (video.videoWidth > 0 && video.videoHeight > 0 && video.duration > 0) {
        processVideoMetadata();
      }
    };

    const handleLoadedData = () => {
      console.log("loadeddata event fired");
      console.log("ReadyState:", video.readyState);

      if (
        video.readyState >= 2 &&
        video.videoWidth > 0 &&
        video.videoHeight > 0
      ) {
        processVideoMetadata();
      }
    };

    const handleCanPlay = () => {
      console.log("canplay event fired");
      if (video.videoWidth > 0 && video.videoHeight > 0 && video.duration > 0) {
        processVideoMetadata();
      }
    };

    const handleError = (e) => {
      console.error("Video error event:", e);
      console.error("Video error code:", video.error?.code);
      console.error("Video error message:", video.error?.message);

      let errorMessage = "Unknown video error";
      if (video.error) {
        switch (video.error.code) {
          case 1:
            errorMessage = "Video loading aborted";
            break;
          case 2:
            errorMessage = "Network error while loading video";
            break;
          case 3:
            errorMessage = "Video decoding error";
            break;
          case 4:
            errorMessage = "Video format not supported";
            break;
        }
      }

      console.error("Error details:", errorMessage);
      actions.setVideoLoading(false);
    };

    // Attach event listeners
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("loadeddata", handleLoadedData);
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("error", handleError);

    // Set source and load
    console.log("Setting video source:", videoSrc);
    video.src = videoSrc;

    // Store reference
    videoRef.current = video;

    // Cleanup function
    return () => {
      console.log("Cleaning up video element");

      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("loadeddata", handleLoadedData);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("error", handleError);

      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.removeAttribute("src");
        videoRef.current.load();

        if (videoRef.current.parentNode) {
          videoRef.current.parentNode.removeChild(videoRef.current);
        }

        videoRef.current = null;
      }
    };
  }, [videoSrc, actions, retryCount]);

  // Extract frame when current frame changes
  useEffect(() => {
    if (!videoRef.current || !videoSrc || video.totalFrames === 0) {
      console.log("Skipping frame extraction:", {
        hasVideoRef: !!videoRef.current,
        hasVideoSrc: !!videoSrc,
        totalFrames: video.totalFrames,
      });
      return;
    }

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

