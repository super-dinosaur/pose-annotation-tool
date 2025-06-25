/**
 * Application header with toolbar
 */

import React, { useCallback, useEffect, useState } from "react";
import { Button, message, Typography } from "antd";
import {
  SaveOutlined,
  PlusOutlined,
  PlayCircleOutlined,
  StopOutlined,
} from "@ant-design/icons";
import { VideoUpload } from "../../features/video";
import { useAppContext } from "../../store";
import { exportAnnotationsToJson } from "../../utils/export";
import {
  checkBackendHealth,
  startInference,
  getNextInferenceResult,
  saveAndContinue,
  stopInference,
} from "../../services/inferenceService";
import { KEYPOINTS, PERSON_COLORS } from "../../constants";
import "./AppHeader.css";

const { Text } = Typography;

// Keypoint name mapping from inference output to frontend IDs
const INFERENCE_TO_KEYPOINT_ID = {
  'nose': 0,
  'left_eye': 1,
  'right_eye': 2,
  'left_ear': 3,
  'right_ear': 4,
  'left_shoulder': 5,
  'right_shoulder': 6,
  'left_elbow': 7,
  'right_elbow': 8,
  'left_wrist': 9,
  'right_wrist': 10,
  'left_hip': 11,
  'right_hip': 12,
  'left_knee': 13,
  'right_knee': 14,
  'left_ankle': 15,
  'right_ankle': 16
};

/**
 * AppHeader component
 * @returns {JSX.Element}
 */
export const AppHeader = () => {
  const { state, actions } = useAppContext();
  const { video, annotation, ui } = state;
  
  // Inference state
  const [inferenceRunning, setInferenceRunning] = useState(false);
  const [waitingForNext, setWaitingForNext] = useState(false);
  const [currentInferenceFrame, setCurrentInferenceFrame] = useState(null);

  // Handle video upload
  const handleVideoUpload = useCallback(
    (videoSrc, videoName, serverPath) => {
      console.log("====== AppHeader 处理视频上传 ======");
      console.log("1. 接收到的参数:", { videoSrc, videoName, serverPath });

      if (!videoSrc) {
        console.error("错误: 没有视频源");
        message.error("加载视频失败：没有提供源");
        return;
      }

      try {
        // Stop any running inference
        if (inferenceRunning) {
          handleStopInference();
        }
        
        // 清除之前的标注
        console.log("2. 重置标注");
        actions.resetAnnotations();

        // 设置视频源
        console.log("3. 调用 actions.setVideoSrc");
        actions.setVideoSrc(videoSrc, videoName, serverPath);

        console.log("4. 视频上传处理完成");
        // message.success(`视频 "${videoName}" 加载成功`);
        // message.success(`视频已上传到"${serverPath}"位置`);
      } catch (error) {
        console.error("处理视频上传时出错:", error);
        message.error("处理视频上传失败");
      }
    },
    [actions, inferenceRunning],
  );

  // Save all annotations
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

  // Add person
  const handleAddPerson = useCallback(() => {
    actions.setAddPersonModal(true);
  }, [actions]);

  // Main inference handler - handles both start and continue
  const handleInferenceNextFrame = useCallback(async () => {
    if (!video.src) {
      message.error("请先加载视频");
      return;
    }

    try {
      // First time - start the inference process
      if (!inferenceRunning) {
        // Check backend health
        const isBackendHealthy = await checkBackendHealth();
        if (!isBackendHealthy) {
          throw new Error(
            "Backend server is not running. Please start the backend server.",
          );
        }

        message.info("启动推理...");
        
        // Start inference with video name (or path)
        await startInference(video.name);
        setInferenceRunning(true);
        setWaitingForNext(true);
        
        // Get first frame result
        const result = await getNextInferenceResult();
        handleInferenceResult(result);
        
      } else if (currentInferenceFrame !== null && !waitingForNext) {
        // Continue to next frame - save current annotations first
        message.info("保存当前帧标注并继续...");
        
        const frameKey = `frame_${currentInferenceFrame}`;
        const frameAnnotations = annotation.annotations[frameKey] || {};
        
        // Save current frame annotations as fin_frame_N.json
        await saveAndContinue(currentInferenceFrame, {
          frame: currentInferenceFrame,
          annotations: frameAnnotations,
          persons: annotation.persons,
          timestamp: new Date().toISOString()
        });
        
        setWaitingForNext(true);
        
        // Get next frame result
        const result = await getNextInferenceResult();
        handleInferenceResult(result);
      }
      
    } catch (error) {
      console.error("Inference error:", error);
      message.error(`推理失败: ${error.message}`);
      setWaitingForNext(false);
    }
  }, [video.src, video.name, inferenceRunning, currentInferenceFrame, waitingForNext, annotation]);

  // Process inference result and display on canvas
  const handleInferenceResult = useCallback((result) => {
    console.log("Received inference result:", result);
    
    // Check if inference is completed
    if (result.status === "completed") {
      message.info("所有帧处理完成！");
      handleStopInference();
      return;
    }
    
    // Check for errors
    if (result.status === "error") {
      message.error(`推理错误: ${result.error}`);
      setWaitingForNext(false);
      return;
    }

    const { frame, predictions } = result;
    setCurrentInferenceFrame(frame);
    setWaitingForNext(false);
    
    if (!predictions || predictions.length === 0) {
      message.warning(`第 ${frame} 帧未检测到任何人`);
      return;
    }

    // Clear existing annotations for this frame (optional)
    // const frameKey = `frame_${frame}`;
    // You might want to keep existing manual annotations
    
    // Process each detected person
    predictions.forEach((prediction, index) => {
      // Handle person ID
      let personId = prediction.person_id || `person_${index}`;
      let person = annotation.persons.find(p => p.id === personId);
      
      if (!person) {
        // Create new person
        const colorIndex = annotation.persons.length % PERSON_COLORS.length;
        const personName = personId.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
        person = actions.addPerson(personName, PERSON_COLORS[colorIndex]);
        personId = person.id;
      }
      
      // Add keypoints
      Object.entries(prediction.keypoints).forEach(([keypointName, data]) => {
        const keypointId = INFERENCE_TO_KEYPOINT_ID[keypointName];
        
        if (keypointId !== undefined && data.confidence > 0.5) {
          actions.addAnnotation(
            frame,
            person.id,
            keypointId,
            { x: Math.round(data.x), y: Math.round(data.y) }
          );
        }
      });
    });
    
    // Navigate to this frame
    actions.setCurrentFrame(frame);
    
    message.success(`第 ${frame} 帧推理完成，检测到 ${predictions.length} 个人`);
  }, [annotation.persons, actions]);

  // Stop inference
  const handleStopInference = useCallback(async () => {
    try {
      await stopInference();
      setInferenceRunning(false);
      setWaitingForNext(false);
      setCurrentInferenceFrame(null);
      message.success("推理已停止");
    } catch (error) {
      console.error("Stop inference error:", error);
      message.error("停止推理失败");
    }
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (inferenceRunning) {
        stopInference().catch(console.error);
      }
    };
  }, [inferenceRunning]);

  // UI state
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
        <div className="header-buttons">
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
            onClick={handleInferenceNextFrame}
            disabled={!hasVideo || waitingForNext}
            loading={waitingForNext}
            type="primary"
          >
            {!inferenceRunning 
              ? "Start Inference" 
              : waitingForNext
                ? "Processing..."
                : "Inference Next Frame"}
          </Button>

          {inferenceRunning && (
            <Button
              icon={<StopOutlined />}
              onClick={handleStopInference}
              danger
            >
              Stop Inference
            </Button>
          )}
        </div>
      </div>

      <div className="header-right">
        {hasVideo && (
          <div className="header-info">
            <Text type="secondary">
              Frame: {video.currentFrame + 1} / {video.totalFrames}
            </Text>
            {annotation.selectedPersonId && (
              <Text type="secondary" className="header-info-item">
                Current:{" "}
                {
                  annotation.persons.find(
                    (p) => p.id === annotation.selectedPersonId,
                  )?.name
                }
              </Text>
            )}
            {inferenceRunning && currentInferenceFrame !== null && (
              <Text type="warning" className="header-info-item">
                Inference Frame: {currentInferenceFrame + 1}
              </Text>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AppHeader;
