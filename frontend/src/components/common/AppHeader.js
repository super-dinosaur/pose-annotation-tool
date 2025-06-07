/**
 * Application header with toolbar
 */

import React, { useCallback } from "react";
import { Space, Button, message, Typography } from "antd";
import {
  SaveOutlined,
  PlusOutlined,
  PlayCircleOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { VideoUpload } from "../../features/video";
import { useAppContext } from "../../store";
import { exportAnnotationsToJson } from "../../utils/export";
import "./AppHeader.css";

const { Text } = Typography;

/**
 * AppHeader component
 * @returns {JSX.Element}
 */
export const AppHeader = () => {
  const { state, actions } = useAppContext();
  const { video, annotation, ui } = state;

  // Debug: Log the current video state
  console.log("Current video state:", {
    src: video.src,
    name: video.name,
    isLoading: video.isLoading,
    hasFrameImage: !!video.frameImage,
    totalFrames: video.totalFrames,
  });

  const handleVideoUpload = useCallback(
    (videoSrc, videoName) => {
      console.log("=== VIDEO UPLOAD CALLBACK STARTED ===");
      console.log("Video source:", videoSrc);
      console.log("Video name:", videoName);

      if (!videoSrc) {
        console.error("No video source provided!");
        message.error("Failed to load video: No source provided");
        return;
      }

      if (!videoName) {
        console.warn("No video name provided, using default");
        videoName = "uploaded_video.mp4";
      }

      try {
        // Clear previous annotations but keep UI state
        actions.resetAnnotations();
        console.log("Annotations reset");

        // Set the video source in state
        actions.setVideoSrc(videoSrc, videoName);
        console.log("Video source set in state:", videoSrc);

        message.success(`Video "${videoName}" loaded successfully`);
        console.log("=== VIDEO UPLOAD CALLBACK COMPLETED ===");
      } catch (error) {
        console.error("Error in handleVideoUpload:", error);
        message.error("Failed to process video upload");
      }
    },
    [actions],
  );

  const handleSaveAnnotations = useCallback(() => {
    if (
      !annotation.annotations ||
      Object.keys(annotation.annotations).length === 0
    ) {
      message.warning("No annotations to save");
      return;
    }

    const filename = `${video.name.split(".")[0]}_annotations.json`;
    exportAnnotationsToJson(
      annotation.annotations,
      annotation.persons,
      video.info,
      filename,
    );
    message.success("Annotations saved successfully");
  }, [annotation.annotations, annotation.persons, video.info, video.name]);

  const handleAddPerson = useCallback(() => {
    actions.setAddPersonModal(true);
  }, [actions]);

  const handleInference = useCallback(() => {
    // TODO: Implement inference logic
    message.info("Inference feature will be implemented");
  }, []);

  const hasAnnotations =
    annotation.annotations && Object.keys(annotation.annotations).length > 0;
  const hasVideo = Boolean(video.src);

  return (
    <div className="app-header">
      <div className="header-left">
        <Text strong className="app-title">
          Human Pose Annotation Tool
        </Text>
      </div>

      <div className="header-center">
        <Space size="middle">
          <VideoUpload onVideoUpload={handleVideoUpload} />

          <Button
            icon={<SaveOutlined />}
            onClick={handleSaveAnnotations}
            disabled={!hasVideo || !hasAnnotations}
            type="primary"
          >
            Save Annotations
          </Button>

          <Button
            icon={<PlusOutlined />}
            onClick={handleAddPerson}
            disabled={!hasVideo}
            type="primary"
          >
            Add Person
          </Button>

          <Button
            icon={<PlayCircleOutlined />}
            onClick={handleInference}
            disabled={!hasVideo || ui.isInferencing}
            loading={ui.isInferencing}
            type="primary"
          >
            {ui.isInferencing ? "Inferencing..." : "Inference Next Frame"}
          </Button>
        </Space>
      </div>

      <div className="header-right">
        {hasVideo && (
          <Space>
            <Text type="secondary">
              Frame: {video.currentFrame + 1} / {video.totalFrames}
            </Text>
            {annotation.selectedPersonId && (
              <Text type="secondary">
                Current:{" "}
                {
                  annotation.persons.find(
                    (p) => p.id === annotation.selectedPersonId,
                  )?.name
                }
              </Text>
            )}
          </Space>
        )}
      </div>
    </div>
  );
};

export default AppHeader;
