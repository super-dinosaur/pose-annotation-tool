/**
 * Video upload component with extensive debugging
 */

import React, { useCallback } from "react";
import { Upload, Button, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { validateVideoFile, createVideoUrl } from "../services/videoService";

/**
 * VideoUpload component
 * @param {Object} props - Component props
 * @param {Function} props.onVideoUpload - Callback when video is uploaded
 * @param {boolean} props.disabled - Whether upload is disabled
 * @returns {JSX.Element}
 */
export const VideoUpload = ({ onVideoUpload, disabled = false }) => {
  // Debug: Log when component mounts
  React.useEffect(() => {
    console.log("VideoUpload component mounted");
    console.log("onVideoUpload function provided:", !!onVideoUpload);
    console.log("disabled:", disabled);
  }, []);

  const handleFileSelect = useCallback(
    (file) => {
      console.log("=== FILE SELECTED ===");
      console.log("File:", file);
      console.log("File name:", file.name);
      console.log("File type:", file.type);
      console.log("File size:", file.size, "bytes");

      // Validate file
      const isValid = validateVideoFile(file);
      console.log("Is valid video file:", isValid);

      if (!isValid) {
        message.error("Please select a valid video file!");
        return false;
      }

      // Check file size
      const maxSize = 500 * 1024 * 1024; // 500MB
      if (file.size > maxSize) {
        message.error("Video file is too large! Maximum size is 500MB.");
        return false;
      }

      // Process the file immediately
      try {
        console.log("Creating video URL...");
        const videoUrl = createVideoUrl(file);
        console.log("Video URL created successfully:", videoUrl);

        if (onVideoUpload) {
          console.log("Calling onVideoUpload...");
          onVideoUpload(videoUrl, file.name);
        } else {
          console.error("onVideoUpload callback is not defined!");
        }

        message.success(`${file.name} loaded successfully`);
      } catch (error) {
        console.error("Error processing video:", error);
        message.error("Failed to process video file");
      }

      // Return false to prevent default upload behavior
      return false;
    },
    [onVideoUpload],
  );

  const uploadProps = {
    name: "video",
    accept: "video/*",
    showUploadList: false,
    beforeUpload: handleFileSelect,
    disabled: disabled,
  };

  return (
    <div>
      <Upload {...uploadProps}>
        <Button
          icon={<UploadOutlined />}
          type="primary"
          disabled={disabled}
          onClick={() => console.log("Upload button clicked")}
        >
          Upload Video
        </Button>
      </Upload>
      <div style={{ marginTop: "10px", fontSize: "12px", color: "#666" }}>
        Debug: Component is {disabled ? "disabled" : "enabled"}
      </div>
    </div>
  );
};

export default VideoUpload;
