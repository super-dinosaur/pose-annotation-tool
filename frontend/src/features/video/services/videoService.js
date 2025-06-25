/**
 * Video service for handling video operations
 */

import { calculateTotalFrames as utilCalculateTotalFrames } from "../../../utils/video";
import { detectBlackBorders } from "../../../utils/videoCrop";

/**
 * Extract frame from video element
 * @param {HTMLVideoElement} videoElement - Video element
 * @param {number} frameIndex - Frame index
 * @param {number} frameRate - Frame rate
 * @param {Object|string} cropBounds - Crop bounds {x, y, width, height} or 'auto' for auto-detection
 * @returns {Promise<string>} Frame image data URL
 */
export const extractFrameFromVideo = (videoElement, frameIndex, frameRate, cropBounds = null) => {
  return new Promise((resolve, reject) => {
    console.log("extractFrameFromVideo called:", { frameIndex, frameRate });

    if (!videoElement) {
      reject(new Error("Video element not found"));
      return;
    }

    // Check if video is ready
    if (videoElement.readyState < 2) {
      console.error("Video not ready, readyState:", videoElement.readyState);
      reject(new Error("Video not ready for frame extraction"));
      return;
    }

    // Check video dimensions
    if (videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
      console.error(
        "Invalid video dimensions:",
        videoElement.videoWidth,
        "x",
        videoElement.videoHeight,
      );
      reject(new Error("Invalid video dimensions"));
      return;
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      reject(new Error("Failed to get canvas context"));
      return;
    }

    // Function to draw the current frame
    const drawFrame = () => {
      try {
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;

        console.log(
          "Drawing frame with dimensions:",
          canvas.width,
          "x",
          canvas.height,
        );

        // Clear canvas first
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw the video frame
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

        // Handle cropping
        let finalCanvas = canvas;
        let actualCropBounds = null;
        
        if (cropBounds === 'auto') {
          // Auto-detect black borders
          const detected = detectBlackBorders(canvas);
          console.log('Auto-detected crop bounds:', detected);
          
          // Only crop if significant borders detected (more than 5% of dimension)
          const widthReduction = (canvas.width - detected.width) / canvas.width;
          const heightReduction = (canvas.height - detected.height) / canvas.height;
          
          if (widthReduction > 0.05 || heightReduction > 0.05) {
            actualCropBounds = detected;
          }
        } else if (cropBounds && typeof cropBounds === 'object') {
          actualCropBounds = cropBounds;
        }
        
        // Apply cropping if needed
        if (actualCropBounds) {
          const croppedCanvas = document.createElement('canvas');
          croppedCanvas.width = actualCropBounds.width;
          croppedCanvas.height = actualCropBounds.height;
          const croppedCtx = croppedCanvas.getContext('2d');
          
          croppedCtx.drawImage(
            canvas,
            actualCropBounds.x,
            actualCropBounds.y,
            actualCropBounds.width,
            actualCropBounds.height,
            0,
            0,
            actualCropBounds.width,
            actualCropBounds.height
          );
          
          finalCanvas = croppedCanvas;
        }

        // Convert to data URL
        const dataUrl = finalCanvas.toDataURL("image/jpeg", 0.8);

        if (!dataUrl || dataUrl === "data:,") {
          throw new Error("Failed to generate data URL");
        }

        console.log(
          "Frame extracted successfully, data URL length:",
          dataUrl.length,
        );
        resolve(dataUrl);
      } catch (error) {
        console.error("Error drawing frame:", error);
        reject(error);
      }
    };

    // For the first frame, try to draw immediately
    if (frameIndex === 0 && videoElement.currentTime === 0) {
      // Wait for next animation frame to ensure video is ready
      requestAnimationFrame(() => {
        drawFrame();
      });
      return;
    }

    // For other frames, seek to the specific time
    const targetTime = frameIndex / frameRate;

    console.log("Seeking to time:", targetTime);

    // Remove any existing seeked listeners
    const existingListeners = videoElement.getEventListeners?.("seeked") || [];
    existingListeners.forEach((listener) => {
      videoElement.removeEventListener("seeked", listener);
    });

    let seekTimeout;

    const handleSeeked = () => {
      console.log(
        "Seeked event fired, current time:",
        videoElement.currentTime,
      );
      clearTimeout(seekTimeout);

      // Wait for next frame to ensure the seek is complete
      requestAnimationFrame(() => {
        drawFrame();
      });

      videoElement.removeEventListener("seeked", handleSeeked);
    };

    // Add seeked listener
    videoElement.addEventListener("seeked", handleSeeked);

    // Set current time
    videoElement.currentTime = targetTime;

    // Fallback timeout
    seekTimeout = setTimeout(() => {
      console.warn("Seek timeout, attempting to draw anyway");
      videoElement.removeEventListener("seeked", handleSeeked);
      drawFrame();
    }, 3000);
  });
};

/**
 * Calculate total frames from duration and frame rate
 * @param {number} duration - Video duration in seconds
 * @param {number} frameRate - Frame rate
 * @returns {number} Total frames
 */
export const calculateTotalFrames = utilCalculateTotalFrames;

/**
 * Get video metadata
 * @param {string} videoSrc - Video source URL
 * @returns {Promise<Object>} Video metadata
 */
export const getVideoMetadata = (videoSrc) => {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");

    // Don't set crossOrigin for blob URLs
    if (!videoSrc.startsWith("blob:")) {
      video.crossOrigin = "anonymous";
    }

    video.preload = "metadata";
    video.muted = true;

    const timeout = setTimeout(() => {
      reject(new Error("Video metadata loading timeout"));
    }, 10000);

    video.onloadedmetadata = () => {
      clearTimeout(timeout);

      const metadata = {
        width: video.videoWidth,
        height: video.videoHeight,
        duration: video.duration,
        // Note: Actual frame rate is hard to get from HTML5 video
        // This is an approximation
        frameRate: 30,
      };

      console.log("Video metadata loaded:", metadata);
      resolve(metadata);
    };

    video.onerror = (e) => {
      clearTimeout(timeout);
      console.error("Video metadata loading error:", e);
      reject(new Error("Failed to load video metadata"));
    };

    video.src = videoSrc;
  });
};

/**
 * Validate video file
 * @param {File} file - Video file
 * @returns {boolean} Whether file is valid video
 */
export const validateVideoFile = (file) => {
  if (!file) return false;

  const validTypes = [
    "video/mp4",
    "video/webm",
    "video/ogg",
    "video/avi",
    "video/mov",
    "video/wmv",
    "video/quicktime", // Add quicktime support
  ];

  // Check MIME type
  const isValidType =
    validTypes.includes(file.type) || file.type.startsWith("video/");

  // Also check file extension as a fallback
  const validExtensions = [
    ".mp4",
    ".webm",
    ".ogg",
    ".avi",
    ".mov",
    ".wmv",
    ".mkv",
    ".m4v",
  ];
  const fileName = file.name.toLowerCase();
  const hasValidExtension = validExtensions.some((ext) =>
    fileName.endsWith(ext),
  );

  return isValidType || hasValidExtension;
};

/**
 * Create video URL from file
 * @param {File} file - Video file
 * @returns {string} Video URL
 */
export const createVideoUrl = (file) => {
  const url = URL.createObjectURL(file);
  console.log("Created video URL:", url);
  return url;
};

/**
 * Cleanup video URL
 * @param {string} url - Video URL to cleanup
 */
export const cleanupVideoUrl = (url) => {
  if (url && url.startsWith("blob:")) {
    URL.revokeObjectURL(url);
    console.log("Cleaned up video URL:", url);
  }
};

/**
 * 将视频文件上传到服务器
 * @param {File} file - 视频文件
 * @returns {Promise<string>} 返回服务器上视频的路径
 */
export const uploadVideoToServer = async (file) => {
  const formData = new FormData();
  formData.append("video", file);

  try {
    const response = await fetch("http://localhost:5000/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("上传失败");
    }

    const result = await response.json();
    return result.filePath; // 假设服务器返回 { filePath: "/uploads/xxx.mp4" }
  } catch (error) {
    console.error("上传到服务器失败:", error);
    return null;
  }
};
