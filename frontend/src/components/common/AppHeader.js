/**
 * Application header with toolbar
 */

import React, { useCallback, useEffect } from "react";
import { Space, Button, message, Typography } from "antd";
import {
  SaveOutlined,
  PlusOutlined,
  PlayCircleOutlined,
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

  const handleVideoUpload = useCallback(
    (videoSrc, videoName) => {
      console.log("====== AppHeader 处理视频上传 ======");
      console.log("1. 接收到的参数:", { videoSrc, videoName });

      if (!videoSrc) {
        console.error("错误: 没有视频源");
        message.error("加载视频失败：没有提供源");
        return;
      }

      try {
        // 清除之前的标注
        console.log("2. 重置标注");
        actions.resetAnnotations();

        // 设置视频源
        console.log("3. 调用 actions.setVideoSrc");
        actions.setVideoSrc(videoSrc, videoName);
        
        console.log("4. 视频上传处理完成");
        message.success(`视频 "${videoName}" 加载成功`);
      } catch (error) {
        console.error("处理视频上传时出错:", error);
        message.error("处理视频上传失败");
      }
    },
    [actions]
  );

  const handleSaveAnnotations = useCallback(() => {
    if (
      !annotation.annotations ||
      Object.keys(annotation.annotations).length === 0
    ) {
      message.warning("没有标注可以保存");
      return;
    }

    const filename = `${video.name.split(".")[0]}_annotations.json`;
    exportAnnotationsToJson(
      annotation.annotations,
      annotation.persons,
      video.info,
      filename,
    );
    message.success("标注保存成功");
  }, [annotation.annotations, annotation.persons, video.info, video.name]);

  const handleAddPerson = useCallback(() => {
    actions.setAddPersonModal(true);
  }, [actions]);

  const handleInference = useCallback(() => {
    message.info("推理功能将会实现");
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
        <Space size="middle" align="center">
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
